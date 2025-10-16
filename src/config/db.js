import { Pool } from "pg"
const pool = new Pool({
    user: "postgres",
    host: "localhost",
    password: "root",
    database: "trello",
    port: 5432
})

export default pool