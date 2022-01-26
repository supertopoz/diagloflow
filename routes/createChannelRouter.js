var express = require('express');
var axios = require('axios');
var router = express.Router();
const { v4: uuidv4 } = require('uuid');

const app_id = process.env.SENDBIRD_APP_ID
const sendbird_api_token = process.env.SENDBIRD_API_TOKEN
const allowed_bot_ids = process.env.ALLOWED_BOT_IDS
const allowed_bot_types = process.env.ALLOWED_BOT_TYPES

const createBot = async (bot_id, bot_type) => {
    var data = JSON.stringify({
        "bot_userid": bot_id,
        "bot_nickname": bot_id,
        "bot_profile_url": "",
        "bot_type": bot_type,
        "bot_callback_url": "https://bot.com",
        "is_privacy_mode": true
    });

    var config = {
        method: 'post',
        url: `https://api-${app_id}.sendbird.com/v3/bots`,
        headers: {
            'Api-Token': sendbird_api_token,
            'Content-Type': 'application/json'
        },
        data:data
    };
    try {
        const result = await axios(config);
        return {error: false, message: "Bot created"}
    } catch (e){
        return e.response.data
    }
}


/* create_channel. */
router.post('/', async function (req, res, next) {

    //TODO Create Sendbird channel and add bot into the channel.
    const bot_id = req.body.bot_id;
    const user_id = req.body.user_id;
    const bot_type = req.body.bot_type
    const channel_prefix = req.body.channel_prefix

    //Check bot details are allowed
    if(allowed_bot_ids.split(",").indexOf(bot_id) < 0) return res.send({error:true, message:"bot_id not in allow list"})
    if(allowed_bot_types.split(",").indexOf(bot_type) < 0) return res.send({error:true, message:"bot_type not in allow list"})

    //Check bot with given id exists.
    const botExistance = await createBot(bot_id, bot_type)
    if(botExistance.error === false || botExistance.message == `"bot_userid(${bot_id})" violates unique constraint.`) {
        //Create channel add bot to channel.
        const channelUrl = `${channel_prefix}_${ uuidv4() }`
        res.send({error:false, message: channelUrl})
        //TODO create distinct channel with the user and bot in the same channel.
        return
    }
    else if (botExistance.error) {
        res.status(404).send({error: true, message:"Failed to create channel - Bot create error!"})
        return
    }

    //Create bot if doesn't exist and add endpoint from Heroku.

    //Add bot to channel.



    res.status(200).send("Ok")
});

module.exports = router;
