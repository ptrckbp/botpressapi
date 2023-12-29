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

const sendToWebhook = async ({ payload, ctx, conversation, ack, logger }) => {
  await axios.post(ctx.configuration.externalWebhookUrl, payload);

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

    if (!req.body) {
      logger
        .forBot()
        .warn("Handler received an empty body, so the message was ignored");

      return {
        status: 400,
        body: "Empty body",
      };
    }

    const data = JSON.parse(req.body);

    const conversationId = data.message?.chat?.id;

    if (!conversationId) {
      logger
        .forBot()
        .warn(
          'Handler received message with empty "chat.id" value, so the message was ignored'
        );

      return {
        status: 400,
        body: "Expected message.chat.id",
      };
    }

    const userId = data.message.from?.id;

    if (!userId) {
      logger
        .forBot()
        .warn(
          'Handler received message with empty "from.id" value, so the message was ignored'
        );

      return {
        status: 400,
        body: "Expected message.from.id",
      };
    }

    const { conversation } = await client.getOrCreateConversation({
      channel: "channel",
      tags: {
        [idTag]: conversationId.toString(),
        metadata: JSON.stringify(data.conversation.metadata),
        foreignKey: data.conversation.foreignKey,
      },
    });

    const userName = data.message.from?.name;

    const { user } = await client.getOrCreateUser({
      tags: {
        [idTag]: userId.toString(),
        metadata: JSON.stringify(data.user.metadata),
        foreignKey: data.user.foreignKey,
      },
      ...(userName && { name: userName }),
    });

    const messageId = data.message.message_id;

    if (!messageId) {
      logger
        .forBot()
        .warn(
          "Handler received an empty message id, so the message was ignored"
        );

      return {
        status: 400,
        body: "Expected message.message_id",
      };
    }

    logger
      .forBot()
      .debug(
        `Received message from user ${userId}: ${JSON.stringify(
          data.message.payload
        )}`
      );
    const result = await client.createMessage({
      tags: {
        [idTag]: messageId.toString(),
        metadata: JSON.stringify(data.message.metadata),
        foreignKey: data.message.foreignKey,
      },
      type: data.message.payload.type,
      userId: user.id,
      conversationId: conversation.id,
      payload: data.message.payload,
    });
    logger
      .forBot()
      .debug(
        `Done creating message in botpress for user ${userId}: ${JSON.stringify(
          data.message.payload
        )}`
      );

    return {
      status: 200,
      body: JSON.stringify(result),
    };
  },
});

export default integration;
