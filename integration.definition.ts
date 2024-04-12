import { IntegrationDefinition, messages } from '@botpress/sdk'
import { z } from 'zod'


export default new IntegrationDefinition({
  name: "plus/messaging",
  title: "Messaging Integration",
  description: "This integration allows you to easily send messages to your bot and get responses back to your endpoint.",
  version: '0.2.0',
  readme: 'README.md',
  icon: "botpress-icon.svg",
  configuration: {
    schema: z.object({
      responseEndpoint: z.string().describe("the url the bot will send its messages to"),
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
