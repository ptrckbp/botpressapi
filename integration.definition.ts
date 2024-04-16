import { IntegrationDefinition, messages } from '@botpress/sdk'
import { z } from 'zod'

export default new IntegrationDefinition({
  name: "plus/messaging",
  title: "Messaging API",
  description: "This integration allows you to easily send messages to your bot and get responses back to your endpoint.",
  version: '0.2.3',
  readme: 'hub.md',
  icon: "botpress-icon.svg",
  configuration: {
    schema: z.object({
      responseEndpointURL: z.string().describe("The bot will send its messages to this URL"),
    }),
  },
  channels: {
    channel: {
      messages: messages.defaults,
      message: { tags: { id: {} } },
      conversation: {
        tags: { id: {} },
        creation: { enabled: true, requiredTags: ['id'] },
      },
    },
  },
  user: {
    tags: {
      id: {}
    },
    creation: { enabled: true, requiredTags: ['id'] },
  },
})
