const router = require('express').Router()
const { isNewUser, isNotNewUser } = require('../middlewares/auth')
const dealer = require('../models/dealer')
const Employee = require('../models/Employee')
const User = require('../models/User')

router.get('/', isNewUser, async(req, res) => {
    try {
        const user = await User.findById(req.c_id).select('ref id')

        if (user) {
            if (user.ref === 'e') {
                const { isActive, _id } = await Employee.findById(user.id).select('isActive')
                return res.status(201).render('user-home', { ref: user.ref || '', id: _id || '', isActive: isActive })
            } else if (user.ref === 'd') {
                const { isActive, _id } = await dealer.findById(user.id).select('isActive')
                return res.status(201).render('user-home', { ref: user.ref || '', id: _id || '', isActive: isActive })
            } else {
                return res.render("error")
            }
        }

    } catch (error) {
        return res.render("error")
    }
})
router.get('/new', isNotNewUser, (req, res) => res.status(201).render('users/new'))

// router.get('/edit', async(req, res) => {

//     try {
//         const user = await User.findById(req.c_id).select('id ref -_id')
//         console.log(user);

//         if (user) {
//             if (user.ref === 'e') {
//                 const { name, phone, location, n_id } = await Employee.findById(user.id).select('name phone location n_id')
//                 return res.status(201).render('users/edit', { name, phone, location, n_id })
//             } else if (user.ref === 'd') {
//                 const { name, phone, location, n_id } = await dealer.findById(user.id).select('name phone location n_id')
//                 return res.status(201).render('users/edit', { name, phone, location, n_id })
//             } else {
//                 return res.render("error")
//             }
//         }

//     } catch (error) {
//         return res.render("error")
//     }

// })
router.post('/new', async(req, res) => {

    let { name, phone, location, n_id, type, _id, date } = req.body
    let now = new Date(Date.now())
    let data = { name, phone, location, n_id, date, reg_date: now }
    try {
        if (type === 'e') {
            const emp = new Employee(data)
            const result = await emp.save()
            await User.updateOne({ _id }, { $set: { id: (await result)._id, ref: type, isNewUser: false } })
        } else if (type === 'd') {
            const sales = new dealer(data)
            const result = await sales.save()
            await User.updateOne({ _id }, { $set: { id: (await result)._id, ref: type, isNewUser: false } })
        } else throw Error('error in data')
        return res.status(201).redirect('/user')
    } catch (error) {
        return res.render("error")
    }

})

module.exports = router