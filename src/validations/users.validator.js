import { z } from "zod"

export const validateUserInfo = z.object({
    name: z.string({ invalid_type_error: `username stringda bulishi kerak!` })
        .min(2, `username kamida 2 ta belgi bulishi shart`)
        .max(40, `TOO LENGTHY NAME`),
    email: z.string({ invalid_type_error: `email stringda bulishi kerak!` }).email(`INVALID EMAIL FORMAT!`),
    password: z.string({ invalid_type_error: `password stringda bulishi kerak!` }).min(8, `PASSWORD MUST BE AT LEAST 8 CHARACTERS!`)
        .max(15, `PASSWORD MUST BE AT MOST 15 CHARACTERS!`)
})

export const validateUserUpdate = z.object({
    name: z.string({ invalid_type_error: `THE USERNAME MUST BE STRING!` })
        .min(2, `USER NAME MUST BE AT LEAST 2 CHARACTERS`)
        .max(40, `TOO LENGTHY NAME`).optional(),
    email: z.string({ invalid_type_error: `EMAIL MUST BE IN A STRING!` }).email(`INVALID EMAIL FORMAT!`).optional(),
    password: z.string({ invalid_type_error: `PASSWORD MUST BE IN STRING!` }).min(8, `PASSWORD MUST BE AT LEAST 8 CHARACTERS!`)
        .max(15, `PASSWORD MUST BE AT MOST 15 CHARACTERS!`).optional()
})