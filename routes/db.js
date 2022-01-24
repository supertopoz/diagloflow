var express = require('express');
const {Pool} = require("pg");
const { createPool, checkTableExistence } = require("./database_utils")
var router = express.Router();

/* GET users listing. */
router.get('/', async function (req, res, next) {


    //Check if the table exists.
    const pool = createPool();
    const client = await pool.connect();
    const tableName = req.query.table
    const tableExists = await checkTableExistence(client, tableName)
    if (tableExists.error) {
        //Do some work creating the table
        const table = await createTable(client, tableName)
        if(table.error){
            res.status(404).send({error: true, message: "Table not found and not created"});
        } else {
            res.status(200).send({error: false, message:table.message})
        }
        client.end()
        return
    } else {
        res.status(200).send(tableExists);
        client.end()
        return
    }
});
module.exports = router;
