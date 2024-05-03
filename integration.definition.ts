import { IntegrationDefinition, messages } from '@botpress/sdk'
import { z } from 'zod'

export default new IntegrationDefinition({
  name: "livestream/voice",
  title: "Voice Messaging API",
  description: "This integration allows you to easily send messages to your bot and get responses back to your endpoint.",
  version: '0.2.3',
  readme: 'hub.md',
  icon: "botpress-icon.svg",
  configuration: {
    schema: z.object({
      responseEndpointURL: z.string().describe("The bot will send its messages to this URL"),
      convertAllTextToAudio: z.boolean().describe("if true, the bot will convert text to audio before sending it to the responseEndpointURL").default(true),
      openaiKey: z.string().describe("the OpenAI API key to use for text-to-speech and speech-to-text"),
    }),
  },
  channels: {
    channel: {
      messages: messages.defaults,
      message: { tags: { id: {} } },
      conversation: {
        tags: { id: {} },
      },
    },
  },
  user: {
    tags: {
      id: {}
    },
  },
})
