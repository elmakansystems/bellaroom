const User = require('../models/User')

const router = require('express').Router()
const bcrypt = require('bcrypt')


router.get('/', async(req, res) => {
    try {
        const users = await User.find().sort('-_id')
        if (users) {
            res.status(200).render('settings', { users })
        } else {
            throw Error("no users")
        }
    } catch (err) {
        return res.render("error")
    }

})

router.post('/update', async(req, res) => {

    let { _id, isAdmin, isEditor, isActive, password } = req.body
    let updates
    try {
        if (password) {
            const salt = await bcrypt.genSalt()
            password = await bcrypt.hash(password, salt)
            updates = { isAdmin, isEditor, isActive, password }
        } else {
            updates = { isAdmin, isEditor, isActive, }
        }
        await User.updateOne({ _id }, { $set: updates })
        return res.redirect("/settings")
    } catch (error) {
        return res.render("error")
    }

})



router.get('/view', (req, res) => res.status(200).render('users/view'))




router.get('/list', (req, res) => res.status(200).render('users/list'))



module.exports = router