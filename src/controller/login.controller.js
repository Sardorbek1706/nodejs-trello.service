import pool from "../config/db.js"
import * as bcrypt from "bcrypt"

export const loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.validatedData
        const { rows } = await pool.query(`SELECT id, password from users where email = $1`, [email])
        const user = rows[0]
        if (!rows) return res.status(404).json({ message: `bunday foydalanuvchi topilmadi registratsiya qilsangiz buladi` })
        const match = await bcrypt.compare(password, user.password)
        if (!match) return res.status(401).json({ message: `parol xato kiritildi` })
        return res.status(200).json({ message: `akkauntizga xush kelibsiz`, userId: user.id })
    } catch (error) {
        console.error(error.message)
        return next(error)
    }
}