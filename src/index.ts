import * as botpress from ".botpress";
import { axios, Conversation } from "@botpress/client";
import handleIncoming from "./handle-incomming";

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
  handler: handleIncoming
});

export default integration;
