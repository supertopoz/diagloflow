var express = require('express');
var axios = require('axios');
var router = express.Router();
const {v4: uuidv4} = require('uuid');

const app_id = process.env.SENDBIRD_APP_ID
const sendbird_api_token = process.env.SENDBIRD_API_TOKEN
const isProduction = process.env.PRODUCTION


const createBot = async (bot_id, bot_type) => {

    let botCallbackUrl = `${process.env.NGROK_ENDPOINT}/dialogue`
    if(isProduction == 'true') botCallbackUrl = `https://${process.env.HEROKU_APP_NAME}.herokuapp.com/dialogue`


    var data = JSON.stringify({
        "bot_userid": bot_id,
        "bot_nickname": bot_id,
        "bot_profile_url": "",
        "bot_type": bot_type,
        "bot_callback_url": botCallbackUrl,
        "is_privacy_mode": true
    });
    var config = {
        method: 'post',
        url: `https://api-${app_id}.sendbird.com/v3/bots`,
        headers: {
            'Api-Token': sendbird_api_token,
            'Content-Type': 'application/json'
        },
        data: data
    };
    try {
        const result = await axios(config);
        return {error: false, message: "Bot created"}
    } catch (e) {
        return e.response.data
    }
}

const createChannel = async (channelName, channelUrl, user_id, bot_id) => {

    var data = JSON.stringify({
        "channel_name": channelName,
        "channel_url": channelUrl,
        "is_distinct": true,
        "user_ids": [user_id, bot_id]
    });

    var config = {
        method: 'post',
        url: `https://api-${app_id}.sendbird.com/v3/group_channels`,
        headers: {
            'Api-Token': sendbird_api_token,
            'Content-Type': 'application/json'
        },
        data: data
    };
    try {
        const result = await axios(config);
        return {error: false, message: result.data}
    } catch (e) {
        return e.response.data
    }
}


const checkIfValuesAreAllowed = (req) => {

    const bot_id = req.body.bot_id;
    const bot_type = req.body.bot_type;
    const allowed_bot_ids = process.env.ALLOWED_BOT_IDS;
    const allowed_bot_types = process.env.ALLOWED_BOT_TYPES;
    if (allowed_bot_ids.split(",").indexOf(bot_id) < 0) return {
        error: true,
        message: "bot_id not in allowed list! Check deployment settings in Heroku"
    }
    if (allowed_bot_types.split(",").indexOf(bot_type) < 0) return {
        error: true,
        message: "bot_type not in allowed list! Check deployment settings in Heroku"
    }
    return {error: false}
}

/* create_channel. */
router.post('/', async function (req, res, next) {

    //TODO refactor localhost as bot endpoint
    //Channel creation requirements
    const bot_id = req.body.bot_id;
    const user_id = req.body.user_id;
    const bot_type = req.body.bot_type
    const channel_name = req.body.channel_name
    const channel_prefix = req.body.channel_url_prefix

    //Check channel creation requirements are valid - prevents unwanted channe creations
    const areValuesAllowed = checkIfValuesAreAllowed(req)
    if(areValuesAllowed.error) return res.send(areValuesAllowed)

    //Check bot with given id exists.
    const botExistance = await createBot(bot_id, bot_type)

    if (botExistance.error === false || botExistance.message == `"bot_userid(${bot_id})" violates unique constraint.`) {
        //Create channel add bot to channel.
        const channel = await createChannel(channel_name, `${channel_prefix}_${uuidv4()}`, user_id, bot_id)
        if (channel.error) return res.send({error: true, message: "failed to create channel"})
        res.send({error: false, message: channel})
        return
    } else if (botExistance.error) {
        res.status(404).send({error: true, message: "Failed to create channel - Bot create error!"})
        return
    }

    res.status(200).send("Ok")
});

module.exports = router;
