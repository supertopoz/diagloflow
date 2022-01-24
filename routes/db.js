var express = require('express');
const {Pool} = require("pg");
var router = express.Router();

const db_url = process.env.DATABASE_URL

const pool = new Pool({
    connectionString: db_url,
    ssl: {
        rejectUnauthorized: false
    }
})

/* GET users listing. */
router.get('/db', async function (req, res, next) {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM test_table');
        const results = { 'results': (result) ? result.rows : null};
        res.render('pages/db', results );
        client.release();
    } catch (err) {
        console.error(err);
        res.send("Error " + err);
    }
});

module.exports = router;
