require('dotenv').config();
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/dialogue');
var createChannelRouter = require('./routes/createChannelRouter');
var {auth, schemaCheck} = require('./middleware/channelCreateMiddleWare')

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



app.use('/', indexRouter);
app.use('/create_channel', auth, schemaCheck, createChannelRouter);
app.use('/dialogue', usersRouter);

module.exports = app;
