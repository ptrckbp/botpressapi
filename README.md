# Botpress Messaging API Integration

This is a simple integration for sending messages to your bot via API and recieving responses. 

One simple api endpoint to get responses from your bot. One configuration parameter to set the recieving endpoint for the bot responses. 

Just send the required information and this integration takes care of gettting/creating users, conversations and messages in Botpress. 

You can see the full documentation [here](https://documenter.getpostman.com/view/20577045/2s9YsDjEqu).


## Getting started

1. Clone this repo
2. `cd botpressapi`
3. open package.json and change the name field to something unique (like botpressapi-your-company-name)
4. `npm i` 
5. `npm run login`
6. `npm run deploy`
7. Go to your bot's workspace on https://app.botpress.cloud
8. Click the gear icon on the top right corner, then "Integrations"
9. Select "botpressapi" on the left hand navigation bar.
10. Click "Install" on the top right button, then select the bot you'd like it installed with.
11. Follow the instructions [here](https://documenter.getpostman.com/view/20577045/2s9YsDjEqu) to use the integration
