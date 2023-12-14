import * as botpress from '.botpress'
import { axios, Conversation } from '@botpress/client'


const INTEGRATION_NAME = 'botpressapi'
const idTag = `${INTEGRATION_NAME}:id` as const
const chatIdTag = `${INTEGRATION_NAME}:chatId` as const // Conversation the message belongs to (see: https://core.telegram.org/bots/api#chat)
const fromUserIdTag = `${INTEGRATION_NAME}:fromUserId` as const

export type IntegrationLogger = Parameters<botpress.IntegrationProps['handler']>[0]['logger']

export function getChat(conversation: Conversation): string {
  const chat = conversation.tags[idTag]

  if (!chat) {
    throw Error(`No chat found for conversation ${conversation.id}`)
  }

  return chat
}

const sendToWebhook = async ({ payload, ctx, conversation, ack, logger }) => {

  await axios.post(ctx.configuration.externalWebhookUrl, payload)

  const chat = getChat(conversation)

  logger.forBot().debug(`Sent message to BotpressApi chat ${chat}:`, JSON.stringify(payload))

}

const integration = new botpress.Integration({
  register: async ({ webhookUrl, ctx }) => {
  },
  unregister: async ({ ctx }) => {
  },
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
    logger.forBot().debug('Handler received request from BotpressApi with payload:', req.body)

    if (!req.body) {
      logger.forBot().warn('Handler received an empty body, so the message was ignored')
      return
    }

    const data = JSON.parse(req.body)


    const conversationId = data.message.chat.id

    if (!conversationId) {
      throw new Error('Handler received message with empty "chat.id" value')
    }

    const userId = data.message.from?.id
    const chatId = data.message.chat?.id

    if (!userId) {
      throw new Error('Handler received message with empty "from.id" value')
    }

    const { conversation } = await client.getOrCreateConversation({
      channel: 'channel',
      tags: {
        [idTag]: conversationId.toString(),
        [fromUserIdTag]: userId.toString(),
        ...(chatId && { [chatIdTag]: chatId.toString() }),
      },
    })


    const userName = data.message.from?.name 

    const { user } = await client.getOrCreateUser({
      tags: {
        [idTag]: userId.toString(),
      },
      ...(userName && { name: userName }),
    })


    const messageId = data.message.message_id

    if (!messageId) {
      throw new Error('Handler received an empty message id')
    }

    logger.forBot().debug(`Received message from user ${userId}: ${JSON.stringify(data.message.payload)}`)
    await client.createMessage({
      tags: {
        [idTag]: messageId.toString(),
        [fromUserIdTag]: userId.toString(),
        ...(chatId && { [chatIdTag]: chatId.toString() }),
      },
      type: data.message.payload.type,
      userId: user.id,
      conversationId: conversation.id,
      payload: data.message.payload,
    })
    logger.forBot().debug(`Done creating message in botpress for user ${userId}: ${JSON.stringify(data.message.payload)}`)
  },
})

export default integration