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
      message: { tags: { id: {}, metadata: {}, foreignKey:{} } },
      conversation: {
        tags: { id: {}, metadata: {}, foreignKey: {} },
        creation: { enabled: true, requiredTags: ['id'] },
      },
    },
  },
  user: {
    tags: {
      id: {},
      metadata: {},
      foreignKey: {},
    },
    creation: { enabled: true, requiredTags: ['id'] },
  },
})
