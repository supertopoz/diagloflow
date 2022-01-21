var pgtools = require("pgtools");
require('dotenv').config();
const { Pool, Client } = require("pg");
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var logger = require('morgan');

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

(async function(){
  await timeout(60000)
  const db_url = process.env.DATABASE_URL
  const connectionString = db_url
  console.log(db_url)
  try {
    const pool = new Pool({
      connectionString: connectionString,
    })
    const client = await pool.connect()
    pool.query('SELECT $1::text as name', ['brianc'], (err, result) => {
      if (err) {
        return console.error('Error executing query', err.stack)
      }
      console.log(result.rows[0].name) // brianc
    })

  } catch (e) {
    console.log("Pool failed!!", e)
  }

})()





var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});



// const config = {
//   user: "postgres",
//   host: "localhost",
//   password: "1234",
//   port: 5432
// };
//
// pgtools.createdb(config, "dialogueflow_db", function(err, res) {
//   if (err) {
//     console.error(err);
//     process.exit(-1);
//   }
//   console.log(res);
// });


module.exports = app;
