import pkg from "pg"
const { Pool } = pkg
const pool = new Pool({
    user: "postgres",
    host: "localhost",
    password: "root",
    database: "postgres",
    port: 5432
})

export async function terminate() {
    try {
        await pool.query(`DROP DATABASE trello;`)
        console.log(`DATABASE TRELLO DROPPED SUCCESSFULLY!`)

    } catch (error) {
        console.log(`ERROR WHILE DROPPTING DATABASE`, error.message)
    }
    const newDB = new Pool({
        user: "postgres",
        host: "localhost",
        password: "root",
        database: "trello",
        port: 5432
    })
    await newDB.query(`drop table users;`)

    await newDB.query(`drop table boards;`)

    await newDB.query(`drop table columnss;`)

    await newDB.query(`drop table tasks;`)

    console.log(`TABLES DELETED SUCCESSFULLY!`)
    return { success: true, message: `TERMINATE COMPLETED!` }
}