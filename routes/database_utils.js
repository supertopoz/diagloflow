const {Pool} = require("pg");

const db_url = process.env.DATABASE_URL

module.exports.createPool = () => {
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

module.exports.checkTableExistence = async (client, tableName) => {
    console.log(tableName)
    try {
        const table = await client.query(`
            SELECT EXISTS (
                SELECT FROM 
                    pg_tables
                WHERE 
                schemaname = 'public' AND 
                tablename  = '${ tableName }'
            );
    `)
        if(table.rows[0].exists === true) {
            return {error: false, message : "Table found"}
        } else {
            return {error: true, message: "Table not found"}
        }
    } catch (e) {
        return {error: true, message: e}
    } finally {

    }
}

module.exports.createTable = async (client, tableName) => {

    const text = `
    CREATE TABLE IF NOT EXISTS ${tableName} (
        "id" SERIAL,
        "user_id" VARCHAR(100) NOT NULL,
        "convo_id" VARCHAR(150) NOT NULL,
        PRIMARY KEY ("id")
    );`
    try {
        const table = await client.query(text)
        return {error:false, message: `Created table: ${tableName}`}
    } catch (e) {
        return {error:true, message: "Could not create table", errorMessage: e}
    } finally {
        client.end()
    }
}