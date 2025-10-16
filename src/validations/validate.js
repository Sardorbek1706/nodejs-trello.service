export function validate(schema) {
    return (req, res, next) => {
        console.log("VALIDATION IS WORKING!")
        const result = schema.safeParse(req.body)
        if (!result.success) {
            return res.status(400).json({ errors: result.error.errors })
        }
        req.validatedData = result.data
        console.log("VALIDATION IS WORKING!")
        console.log(result.data)
        next()
    }
}