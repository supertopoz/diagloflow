var express = require('express');
const axios = require('axios')
const { v4: uuidv4 } = require('uuid');
const dialogflow = require('@google-cloud/dialogflow');
var router = express.Router();

// Instantiates a session client
const sessionClient = new dialogflow.SessionsClient()
const googleProjectId = process.env.GOOGLE_PROJECT_ID
const sendbirdAppId = process.env.SENDBIRD_APP_ID
const sendbirdApiToken = process.env.SENDBIRD_API_TOKEN

async function detectIntent(
    projectId,
    sessionId,
    query,
    contexts,
    languageCode
) {
    // The path to identify the agent that owns the created intent.
    const sessionPath = sessionClient.projectAgentSessionPath(
        projectId,
        sessionId
    );

    // The text query request.
    const request = {
        session: sessionPath,
        queryInput: {
            text: {
                text: query,
                languageCode: languageCode,
            },
        },
    };

    if (contexts && contexts.length > 0) {
        request.queryParams = {
            contexts: contexts,
        };
    }

    const responses = await sessionClient.detectIntent(request);
    return responses[0];
}

async function executeQueries(projectId, sessionId, queries, languageCode) {
    // Keeping the context across queries let's us simulate an ongoing conversation with the bot
    let context;
    let intentResponse;
    for (const query of queries) {
        try {
            console.log(`Sending Query: ${query}`);
            intentResponse = await detectIntent(
                projectId,
                sessionId,
                query,
                context,
                languageCode
            );
            console.log('Detected intent');
            console.log(
                `Fulfillment Text: ${intentResponse.queryResult.fulfillmentText}`
            );

            // Use the context from this response for next queries
            context = intentResponse.queryResult.outputContexts;
            return intentResponse.queryResult.fulfillmentText
        } catch (error) {
            console.log(error);
        }
    }
}

/* POST text to dialogue flow. */
router.post('/', async function (req, res, next) {

// sessionId: String representing a random number or hashed user identifier
    //TODO create auth for webhook calls.
    //TODO return 200 right away.
    res.status(200).send("OK!")
    //Message arrives because bot has this end point registered.
    //TODO handle response from dialogue flow by sending response back to the channel
    //Store the uuid againts user.
// queries: A set of sequential queries to be send to Dialogflow agent for Intent Detection

    const queries = [req.body.message.text.replace("/ ", "")]
// languageCode: Indicates the language Dialogflow agent should use to detect intents
    const languageCode = 'en';
    const sessionId = req.body.channel.channel_url;
    // projectId: ID of the GCP project where Dialogflow agent is deployed
// Imports the Dialogflow library
    const result = await executeQueries(googleProjectId, sessionId, queries, languageCode)

    var data = JSON.stringify({
        "message": result,
        "channel_url": sessionId
    });
    // Webhook arrived - where is the bot_id going to come from? - Channel_url?
    const bot_userid = req.body.bot.bot_userid
    var config = {
        method: 'post',
        url: `https://api-${sendbirdAppId}.sendbird.com/v3/bots/${bot_userid}/send`,
        headers: {
            'Api-Token': sendbirdApiToken,
            'Content-Type': 'application/json'
        },
        data : data
    };
    axios(config)
        .then(function (response) {
            console.log(JSON.stringify(response.data));
        })
        .catch(function (error) {
            console.log(error);
        });
});

module.exports = router;
