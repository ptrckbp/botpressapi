import { Client, isApiError } from "@botpress/client";
import * as types from './types'
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
  } catch (thrown) {
    const e = thrown as zod.ZodError
    // return the human readable error
    return e.issues;
  }
};

const handleIncoming = async ({ req, client, ctx, logger }: types.HandlerProps) => {
  // if path isn't root then return 404
  if (req.path !== "/" && req.path !== "") {
    return {
      status: 404,
      body: "Not found",
    };
  }

  // check if ctx.configuration.responseEndpointURL is set
  if (!ctx.configuration.responseEndpointURL) {
    return {
      status: 400,
      body: "Configuration Error! responseEndpointURL is not set. Please set it in your bot integration configuration.",
    };
  }

  const newAuthHeader = req.headers.authorization!
  const token = newAuthHeader.split(" ")[1];

  const innerClient = (client as any).client as Client
  const integrationId = innerClient.config.headers["x-integration-id"] as string | undefined
  const botId = innerClient.config.headers["x-bot-id"] as string | undefined

  const newClientConfig = {
    integrationId,
    botId,
    token,
  }
  const remotelyAuthenticatedClient = new Client(newClientConfig); // we use this client to make sure we are using a PAT token

  const data = JSON.parse(req.body!);

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
    if (isApiError(error) && error?.code === 401) {
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
