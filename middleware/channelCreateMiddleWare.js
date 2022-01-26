const SendBird = require("sendbird");

const app_id = process.env.SENDBIRD_APP_ID

module.exports.auth = (req, res, next) => {
    const sessionToken = req.headers.authorization.replace("Bearer", "").trim();
    const sb = new SendBird({appId: app_id})
    const userId = req.body.user_id;
    sb.connect(userId, sessionToken).then(user  => {
        sb.disconnect();
        next()
    }).catch(error => {
        res.status(403).send({error: true, message:"User Not authorized"})
    })
}

module.exports.schemaCheck = (req, res, next) => {

    if (JSON.stringify(Object.keys(req.body).sort()) != '["bot_id","bot_type","channel_name","channel_url_prefix","user_id"]') {
        res.send({
            error: true, message: `Incorrect Schema! Required example:{'user_id':'UserA','bot_id':'bot_1','bot_type':'customer','channel_url_prefix':'my_bot_channel_','channel_name':'example_1'}`
        })
        return
    } else {
        next()
    }
}