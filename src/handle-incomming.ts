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

  const data = JSON.parse(req.body);

  const { userId, messageId, conversationId, type, text, payload } = data;

  const inputIssues = getInputIssues(data);

  if (inputIssues.length > 0) {
    return {
      status: 400,
      body: "Validation Error! Issues:" + "\n" + JSON.stringify(inputIssues),
    };
  }

  const { conversation } = await client.getOrCreateConversation({
    channel: "channel",
    tags: {
      id: conversationId,
    },
  });

  const { user } = await client.getOrCreateUser({
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

  const { message } = await client.createMessage(botpressMessage);

  logger
    .forBot()
    .debug(
      `Done creating message in botpress for user ${userId}: ${JSON.stringify(
        payload
      )}`
    );

  return {
    status: 200,
    body: JSON.stringify({ message, user, conversation }),
  };
};

export default handleIncoming;
