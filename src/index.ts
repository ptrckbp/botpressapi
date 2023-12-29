import * as botpress from ".botpress";
import { axios, Conversation } from "@botpress/client";

const INTEGRATION_NAME = "botpressapi";
const idTag = `${INTEGRATION_NAME}:id` as const;

export type IntegrationLogger = Parameters<
  botpress.IntegrationProps["handler"]
>[0]["logger"];

export function getChat(conversation: Conversation): string {
  const chat = conversation.tags[idTag];

  if (!chat) {
    throw Error(`No chat found for conversation ${conversation.id}`);
  }

  return chat;
}

const sendToWebhook = async ({
  payload,
  ctx,
  conversation,
  ack,
  logger,
  user,
  type,
  message,
}) => {
  await axios.post(ctx.configuration.externalWebhookUrl, {
    type,
    payload,
    conversationId: conversation.tags["botpressapi:id"],
    botpressUserId: user.id,
    botpressMessageId: message.id,
    botpressConversationId: conversation.id,
  });

  const chat = getChat(conversation);

  logger
    .forBot()
    .debug(
      `Sent message to BotpressApi chat ${chat}:`,
      JSON.stringify(payload)
    );
};

const integration = new botpress.Integration({
  register: async ({ webhookUrl, ctx }) => {},
  unregister: async ({ ctx }) => {},
  actions: {},
  channels: {
    channel: {
      messages: {
        text: sendToWebhook,
        image: sendToWebhook,
        markdown: sendToWebhook,
        audio: sendToWebhook,
        video: sendToWebhook,
        file: sendToWebhook,
        location: sendToWebhook,
        card: sendToWebhook,
        carousel: sendToWebhook,
        dropdown: sendToWebhook,
        choice: sendToWebhook,
      },
    },
  },
  handler: async ({ req, client, ctx, logger }) => {
    logger
      .forBot()
      .debug(
        "Handler received request from BotpressApi with payload:",
        req.body
      );

    const { userId, messageId, conversationId, type, text, payload } =
      JSON.parse(req.body);

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
  },
});

export default integration;
