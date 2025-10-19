import pool from "../config/db.js"
import * as bcrypt from "bcrypt"
import { v4 as uuidv4 } from "uuid"
import { checkifexists } from "../helpers/checkifexists.js"
export const MainController = (table) => ({
  async getAll(req, res, next) {
    try {
      console.log("CONTROLLER HAS BEEN WORKING!")
      // TABLE CHECKMENT AGAINST INJECTION!
      const allowedTableNames = ["boards", "users", "columns", "tasks"]
      if (!allowedTableNames.includes(table)) {
        return res.status(404).json({ success: false, message: `table nomi topilmadi!` })
      }
      const { page = 1, limit = 10 } = req.query
      const pageNum = parseInt(page)
      const limitNum = parseInt(limit)
      const offset = (pageNum - 1) * limitNum
      // PASSWORD HIDDEN WITHOUT SHOWING AGAIN 
      const all = await pool.query(`SELECT * from ${table} LIMIT $1 OFFSET $2 `, [limitNum, offset])
      const safeData = all.rows.map(data => {
        const { password, ...rest } = data
        return rest;
      })
      return res.status(200).json({
        message: `SUCCESSFULLY RETRIEVED ALL DATA FROM ${table} database`, data: safeData,
        total: all.rows.length, page: pageNum, limit: limitNum
      })
    } catch (error) {
      console.error(error.message)
      return next(error)
    }
  },
  async getOne(req, res, next) {
    try {
      console.log("controller ishlamoqda!")
      const { id } = req.params
      // TABLE CHECKMENT AGAINST INJECTION!
      const allowedTableNames = ["boards", "users", "columns", "tasks"]
      if (!allowedTableNames.includes(table)) {
        return res.status(404).json({ success: false, message: `table nomi topilmadi!` })
      }
      const IdCheck = await pool.query(`SELECT * from  ${table} where id = $1`, [id])
      if (IdCheck.rows.length === 0) {
        const error = new Error(`NOT FOUND SUCH AN ID IN ${table} DATABASE`)
        error.status = 404
        return next(error)
      }
      // PASSWORD HIDDEN WITHOUT SHOWING AGAIN 
      const safeData = IdCheck.rows.map(data => {
        const { password, ...rest } = data
        return rest;
      })
      return res.status(200).json({ message: `data topildi`, data: safeData[0] })
    } catch (error) {
      console.error(error.message)
      return next(error)
    }
  },
  async createOne(req, res, next) {
    try {
      // TABLE CHECKMENT AGAINST INJECTION!
      const allowedTableNames = ["boards", "users", "columns", "tasks"]
      if (!allowedTableNames.includes(table)) {
        return res.status(404).json({ success: false, message: `table nomi topilmadi!` })
      }
      console.log("CONTROLLER IS WORKING!")
      const foreignCheck = req.foreignCheck;
      if (foreignCheck?.table){
        const { table: foreignTable, column, value } = foreignCheck;
        const exists = await checkifexists(foreignTable, column, value);
        if (!exists) return res.status(404).json({ message: `${foreignTable} not found` });
      }
      const data = req.validatedData
      console.log(data)
      // REFERENCE ID CHECKING:
      const foreignKeyMap = {
        user_id: "users",
        board_id: "boards",
        column_id: "columns"
      }
      for (const [column, refTable] of Object.entries(foreignKeyMap)) {
    
        if (data[column] !== undefined) {
          const exists = await checkifexists(refTable, "id", data[column])
          if (!exists) {
            return res.status(404).json({ message: `${refTable} not found for ${column}` })
          }
        }
      }
      // DUPLICATE QIYMATLI COLUMNLAR OLDINI OLISH UCHUN TEKSHIRISH:
      const uniqueColumns = Object.keys(data)
      for (let column of uniqueColumns) {
        const exists = await checkifexists(table, column, data[column])
        if (exists) {
          return res.status(409).json({ success: false, message: `${column} with this value already existed!` })
        }
      }
      // PASSWORD HASHLAB yashirib database ga yuborish
      if (data.password) {
        const hashedPassword = await bcrypt.hash(data.password, 10)
        data.password = hashedPassword
      }
      data.id = uuidv4()
      const keys = Object.keys(data)
      const vals = Object.values(data)
      const query = `INSERT INTO ${table} (${keys.join(", ")}) VALUES (${keys.map((_, i) => `$${i + 1}`).join(",")})
                RETURNING *`
      const { rows } = await pool.query(query, [...vals])
      console.log("CONTROLLER IS WORKING!")
      const safeData = rows.map(data => {
        const { password, ...rest } = data
        return rest;
      })
      return res.status(201).json({ message: `yangi data yaratildi!`, data: safeData[0] })
    } catch (error) {
      console.error(error.message);
      return next(error);
    }
  },
  async updateOne(req, res, next) {
    console.log("CONTROLLER HAS BEEN WORKING!")
    try {
      // TABLE CHECKMENT AGAINST INJECTION!
      const allowedTableNames = ["boards", "users", "columns", "tasks"]
      if (!allowedTableNames.includes(table)) {
        return res.status(404).json({ success: false, message: `table nomi topilmadi!` })
      }
      const { id } = req.params
      const IdCheck = await pool.query(`SELECT * from ${table} where id = $1`, [id])
      if (IdCheck.rows.length === 0) {
        const error = new Error(`NOT FOUND AN ID IN  ${table} DATABASE`)
        error.status = 404
        return next(error)
      }
      const keys = Object.keys(req.validatedData)
      const vals = Object.values(req.validatedData)
      const query = `UPDATE ${table} SET ${keys.map((k, i) => `${k}=$${i + 1}`).join(",")} WHERE id=$${keys.length + 1}
             RETURNING *`
      const { rows } = await pool.query(query, [...vals, req.params.id])
      // PASSWORD HIDDEN WITHOUT SHOWING AGAIN 
      const safeData = rows.map(data => {
        const { password, ...rest } = data
        return rest;
      })
      return res.status(200).json({ message: `data yangilandi!`, data: safeData[0] })
    } catch (error) {
      console.error(error.message)
      return next(error)
    }
  },
  async deleteOne(req, res, next) {
    try {
      console.log("CONTROLLER HAS BEEN WORKING!")
      // TABLE CHECKMENT AGAINST INJECTION!
      const allowedTableNames = ["boards", "users", "columns", "tasks"]
      if (!allowedTableNames.includes(table)) {
        return res.status(404).json({ success: false, message: `NOT FOUND SUCH A TABLE NAME!` })
      }
      const { id } = req.params
      const IdCheck = await pool.query(`SELECT * from ${table} where id = $1`, [id])
      if (IdCheck.rows.length === 0) {
        const error = new Error(`NOT FOUND SUCH AN ID IN ${table} DATABASE`)
        error.status = 404
        return next(error)
      }
      const { rows } = await pool.query(`Delete from  ${table} where id = $1 returning * `, [id])
      // PASSWORD HIDDEN WITHOUT SHOWING AGAIN 
      const safeData = rows.map(data => {
        const { password, ...rest } = data
        return rest;
      })
      return res.status(200).json({ message: `data uchirildi!`, data: safeData[0] })
    } catch (error) {
      console.error(error.message)
      return next(error)
    }
  },
  async search(req, res, next) {
    try {
      // TABLE CHECKMENT AGAINST INJECTION!
      const allowedTableNames = ["boards", "users", "columns", "tasks"]
      if (!allowedTableNames.includes(table)) {
        return res.status(404).json({ success: false, message: `table nomi topilmadi!` })
      }
      console.log("CONTROLLER HAS BEEN WORKING!")
      const {page=1, limit=10, ...filters} = req.query
      const keys = Object.keys(filters)
      const values = Object.values(filters)
      if (keys.length === 0) {
        return res.status(404).json({ message: `qidiruv parametrlari topilmadi!` })
      }
      const pageNum = parseInt(page)
      const limitNum = parseInt(limit)
      const offset = (pageNum - 1) * limitNum
      const Keys = keys.map((key, i) => `${key} ILIKE $${i + 1}`)
      const Values = values.map((v) => `%${v}%`)
      const whereClause = Keys.length ? `WHERE ${Keys.join(" OR ")}` : '';
      const query = `SELECT * FROM ${table} ${whereClause} LIMIT $${Values.length + 1} OFFSET $${Values.length + 2}`;
      const result = await pool.query(query, [...Values, limitNum, offset])
      if (result.rows.length === 0) {
        const error = new Error(`bunaqa ismli narsa topilmadi`)
        error.status = 404
        return next(error)
      }
      // PASSWORD HIDDEN WITHOUT SHOWING AGAIN 
      const safeData = result.rows.map(data => {
        const {password, ...rest } = data
        return rest;
      })
      return res.status(200).json({
        message: `SUCCESSFULLY FOUND FOR THE SEARCH`,
        data: safeData,
        page: pageNum,
        limit: limitNum,
        total: result.rows.length
      })
    } catch (error) {
      console.error(error.message)
      return next(error)
    }
  }
})