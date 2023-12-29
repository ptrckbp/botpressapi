import { Client } from "@botpress/client";
import zod from "zod";

const getInputIssues = (body: any): any[] => {
  const bodySchema = zod.object({
    userId: zod.string(),
    messageId: zod.string(),
    conversationId: zod.string(),
    type: zod.string().min(1),
    text: zod.string().min(1),
    payload: zod
      .object({
        text: zod.string().optional(),
      })
      .optional(),
  });

  try {
    bodySchema.parse(body);
    return [];
  } catch (e) {
    // return the human readable error
    return e.issues;
  }
};

const handleIncoming = async ({ req, client, ctx, logger }) => {
  // if path isn't /messages then return 404
  if (req.path !== "/messages") {
    return {
      status: 404,
      body: "Not found",
    };
  }

  // check if ctx.configuration.externalWebhookUrl is set
  if (!ctx.configuration.externalWebhookUrl) {
    return {
      status: 400,
      body: "Configuration Error! externalWebhookUrl is not set. Please set it in your bot integration configuration.",
    };
  }

  const newAuthHeader = req.headers.authorization;
  const token = newAuthHeader.split(" ")[1];

  const integrationId = client.client.config.headers["x-integration-id"];
  const botId = client.client.config.headers["x-bot-id"];

  const newClientConfig = {
    integrationId,
    botId,
    token,
  }
  const remotelyAuthenticatedClient = new Client(newClientConfig); // we use this client to make sure we are using a PAT token

  const data = JSON.parse(req.body);

  const { userId, messageId, conversationId, type, text, payload } = data;

  const inputIssues = getInputIssues(data);

  if (inputIssues.length > 0) {
    return {
      status: 400,
      body: "Validation Error! Issues:" + "\n" + JSON.stringify(inputIssues),
    };
  }

  try {
    const { conversation } =
      await remotelyAuthenticatedClient.getOrCreateConversation({
        channel: "channel",
        tags: {
          id: conversationId,
        },
      });

    const { user } = await remotelyAuthenticatedClient.getOrCreateUser({
      tags: {
        id: userId,
      },
    });

    const botpressMessage = {
      tags: {
        id: messageId,
      },
      type,
      text,
      userId: user.id,
      conversationId: conversation.id,
      payload,
    };

    if (!payload) {
      botpressMessage.payload = { text: text };
    } else if (!payload.text) {
      botpressMessage.payload.text = text;
    }

    const { message } = await remotelyAuthenticatedClient.createMessage(
      botpressMessage
    );
    return {
      status: 200,
      body: JSON.stringify({ message, user, conversation }),
    };
  } catch (error) {
    // check if error is a 401
    if (error?.code === 401) {
      return {
        status: 401,
        body: "Unauthorized. Please add a valid token to the Authorization header. You can get it at https://app.botpress.cloud/profile/settings",
      };
    }
  }
  // return a generic error
  return {
    status: 400,
    body: "Unknown Error! Please contact the Botpress Team",
  };
};

export default handleIncoming;
