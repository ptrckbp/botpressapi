import * as bpclient from "@botpress/client";
import * as bp from ".botpress";
import * as types from "./types";
import handleIncoming from "./handle-incomming";
import axios from "axios";
import convertTextToAudio from "./convert-text-to-audio";

const INTEGRATION_NAME = "plus/messaging";
const idTag = `${INTEGRATION_NAME}:id` as const;

export type IntegrationLogger = types.Logger;

export function getChat(conversation: types.Conversation): string {
  const chat = conversation.tags[idTag];

  if (!chat) {
    throw Error(`No chat found for conversation ${conversation.id}`);
  }

  return chat;
}

const getAudioFromPayload = async (payload: any, openaiKey: string) => {
  const text = payload.text;

  const options = payload.options;

  let readableString = "";

  if (!payload.text) {
    return null;
  }

  readableString = `${text}`;

  if (options) {
    readableString +=
      "\n" +
      options
        .map((option: any) => {
          return !!option?.title && `- ${option.title}`;
        })
        .join("\n");
  }

  const audioFile = await convertTextToAudio(readableString, "onyx", openaiKey);

  return audioFile;
};

const sendToWebhook = async ({
  payload,
  ctx,
  conversation,
  logger,
  user,
  type,
  message,
}: types.MessageHandlerProps) => {
  let file;

  if (ctx.configuration.convertAllTextToAudio || payload?.forceAudio) {
    file = await getAudioFromPayload(payload, ctx.configuration.openaiKey);
  }

  const formData = new FormData();

  if (file) {
    formData.append("audioFile", file);
  }

  formData.append("payload", JSON.stringify(payload));
  formData.append("type", "audio");
  formData.append("conversationId", conversation.tags[idTag]);
  formData.append("botpressUserId", user.id);
  formData.append("botpressMessageId", message.id);
  formData.append("botpressConversationId", conversation.id);

  await axios.post(ctx.configuration.responseEndpointURL, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  const chat = getChat(conversation);

  logger
    .forBot()
    .debug(
      `Sent message to BotpressApi chat ${chat}:`,
      JSON.stringify(payload)
    );
};

const integration = new bp.Integration({
  register: async ({ ctx }) => {
    if (!ctx.configuration.responseEndpointURL) {
      throw new bpclient.RuntimeError(
        "Configuration Error! responseEndpointURL is not set. Please set it in your bot integration configuration."
      );
    }
    // try calling it to see if you get a 200
    try {
      await axios.post(ctx.configuration.responseEndpointURL, {
        type: "test",
        payload: "test",
      });
    } catch (error) {
      throw new bpclient.RuntimeError(
        "Configuration Error! responseEndpointURL is not reachable. It should return a 200."
      );
    }
    return;
  },
  unregister: async ({}) => {},
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
  handler: handleIncoming,
});

export default integration;
