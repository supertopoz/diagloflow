var express = require('express');
const {Pool} = require("pg");
var router = express.Router();

const db_url = process.env.DATABASE_URL


const execute = async (query, client) => {
    try {
        await client.query(query);  // sends queries
        return true;
    } catch (error) {
        console.error(error.stack);
        return false;
    } finally {
        await client.end();         // closes connection
    }
};

const createPool = () => {

    try {
        pool = new Pool({
            connectionString: db_url,
            ssl: {
                rejectUnauthorized: false
            }
            // ssl: false
        })
        return pool
    } catch (e) {

        console.log("POOL ERROR!", e)
        return
    }

}




/* GET users listing. */
router.get('/', async function (req, res, next) {

    let pool = null
    let client = null;
    // try {
    //     const pool1 = createPool();
    //     client = await pool1.connect();
    //     const result = await client.query('SELECT * FROM test_table');
    //     const results = { 'results': (result) ? result.rows : null};
    //     // res.render('pages/db', results );
    //     res.status(200).send(results)
    //     client.release();
    //
    // } catch (err) {
        const pool2 = createPool();
        const client2 = await pool2.connect();
        const text = `
    CREATE TABLE IF NOT EXISTS "test_table" (
	    "id" SERIAL,
	    "name" VARCHAR(100) NOT NULL,
	    "role" VARCHAR(15) NOT NULL,
	    PRIMARY KEY ("id")
    );`;

        execute(text, client2).then(result => {
            if (result) {
                console.log(result)
                console.log('Table created');
            }
            client2.release();
            res.status(200).send(result);
        });

        // console.error(err);
        // res.send("Error " + err);
     // }
});
module.exports = router;
