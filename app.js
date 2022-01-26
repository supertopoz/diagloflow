require('dotenv').config();
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var logger = require('morgan');
var SendBird = require('sendbird')


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/dialogue');
var dbRouter = require('./routes/db');
var createChannelRouter = require('./routes/createChannelRouter');


var app = express();

const app_id = process.env.SENDBIRD_APP_ID
console.log(app_id)
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

const auth = (req, res, next) => {
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

app.use('/', indexRouter);
app.use('/create_channel', auth, createChannelRouter);
app.use('/dialogue', usersRouter);

app.use('/database', dbRouter)

module.exports = app;
