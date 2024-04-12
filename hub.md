API and configurable endpoint to easily send messages to and from your bot via http requests. You can use this to send messages or other information back and forth between your bot and any back-end application.

## How it works
You configure a webhook url for catching responses from your bot. Your bot may receive several responses for a single incomming message scattered through time. Each webhook invocation sends a single message back to your service.

The body of a webhook response should look like this:

```typescript
type WebhookResponse = {
  type : string, 
  payload : any, // contains the response text or metadata otherwise
  conversationId: string, // use this to send the response to the write location
  botpressUserId: string, // botpress user id for debugging 
  botpressMessageId: string, // botpress message id for debugging 
  botpressConversationId: string, // botpress conversation id for debugging
}
```

You use the API endpoint below to send messages. When sending messages to your bot, you provide a conversationId parameter that will be sent back to your webhook url, so that you may identify where to send your bot's responses.

## Getting started

#### Pre-requisites
All you need is an endpoint to catch your bot's responses that returns http status 200. For trying this out, we recommend a free endpoint on [Request Bin](https://pipedream.com/requestbin). 

#### Steps
1. Click `Install` on the top right and select your bot.
2. Click the popup that appears to configure your integration.
3. Add the url that points to your server's endpoint in the `Response Endpoint URL` field.
4. Copy the Webhook URL at the top of the page, this will be the endpoint for creating messages. Save this for later.
5. In Botpress, click your avatar on the top right, then `Personal Access Tokens`. Create a new token and save it for later.
6. Send an http request with the following content:

| Method | POST |
| ------ | ---- |
| ENDPOINT | **INTEGRATION_WEBHOOK_URL** |
| HEADERS | Authorization: bearer **PERSONAL_ACCESS_TOKEN** |

Your request body should look like this:
```typescript
type BodyParameters = {
  userId: string; // ensures that the message is added for the correct user, in case of multiple users
  messageId: string; // helps prevent duplicates
  conversationId: string; // identifies the conversation uniquely and is used for sending back responses
  type: string; // should be 'text' if the message type is text, otherwise a different string for other types
  text: string; // the text of the user's message if the type is text, or a summary of the payload for other types
  payload: any; // an object containing any data you want to send, specific to the message type
}
```

This allows you to send messages from your integration to Botpress. It responds with the created or existing user, message and conversation objects.