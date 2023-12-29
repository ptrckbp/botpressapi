import { IntegrationDefinition, messages } from '@botpress/sdk'
import { name } from './package.json'
import { z } from 'zod'


export default new IntegrationDefinition({
  name,
  version: '0.2.0',
  configuration: {
    schema: z.object({
      externalWebhookUrl: z.string(),
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
