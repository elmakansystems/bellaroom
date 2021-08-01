const User = require('../models/User')

const router = require('express').Router()
const jwt = require('jsonwebtoken')


router.get('/login', (req, res) => res.status(200).render('users/login'))

router.get('/register', (req, res) => res.status(200).render('users/register'))

router.post('/users/register', async(req, res) => {

    let { email, password, name } = req.body
    email = email.trim()
    password = password.trim()
    name = name.trim()

    try {
        const user = await new User({ email, name, password })
        await user.save()
        return res.status(201).send('done')
    } catch (error) {

        if (error.code === 11000) {
            const errs = [{ err: "هذا البريد مسجل بالفعل", target: 'email' }]
            return res.send({ errs })
        }
        const errs = Object.keys(error.errors).map((err, i) => {
            return {
                err: Object.values(error.errors)[i].message,
                target: err
            }
        })
        return res.status(201).send({ errs })
    }
})

router.post('/users/login', async(req, res) => {
    let { email, password } = req.body
    email = email.trim()
    password = password.trim()
    try {
        const user = await User.login(email, password)
        const token = create_user_token(user._id, user.isAdmin, user.isActive, user.isEditor, user.isNewUser)
        res.cookie('_ms_in', token, { maxAge: 1 * 60 * 60 * 1000, httpOnly: true, secure: process.env.SECURE_ENV })
        return res.status(201).send('done')
    } catch (error) {
        res.status(201).send({ errs: error.message })
    }
})





const create_user_token = (id) => {

    return jwt.sign({ id }, process.env.TOKEN_SECRET, { expiresIn: 1 * 60 * 60 })

}


module.exports = router