API and configurable endpoint to easily send messages to and from your bot via http requests. You can use this to send messages or other information back and forth between your bot and any back-end application.

## How it works
To send messages to your bot, use the API endpoint. When sending messages to your bot, you provide a conversationId parameter that will be sent back to your webhook url, so that you may identify where to send your bot's responses.

To handle responses from your bot, you provide an endpoint url. Each request sent to this endpoint carries a single bot message, and includes the conversationId that was previously provided. Depending on your bot, you could recieve multiple responses, or no responses at all. 

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

+ userId: (string, required) ensures that the message is added for the correct user, in case of multiple users
+ messageId: (string, required) helps prevent duplicates
+ conversationId: (string, required) identifies the conversation uniquely and is used for sending back responses
+ type: (string, required) should be 'text' if the message type is text, otherwise a different string for other types
+ text: (string, required) the text of the user's message if the type is text, or a summary of the payload for other types
+ payload: (any, required) an object containing any data you want to send, specific to the message type

7. On your server, handle the response (make sure your bot is published and responds to messages). The request body should look like this:

+ type: (string, required) specifies the type of the message
+ payload: (any, required) contains the response text or metadata otherwise
+ conversationId: (string, required) use this to send the response to the correct location
+ botpressUserId: (string, required) Botpress user ID for debugging purposes
+ botpressMessageId: (string, required) Botpress message ID for debugging purposes
+ botpressConversationId: (string, required) Botpress conversation ID for debugging purposes


