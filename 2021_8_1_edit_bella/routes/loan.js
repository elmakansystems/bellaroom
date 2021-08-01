const router = require('express').Router()
const Dealer = require("../models/dealer")
const Employee = require("../models/Employee")
const Loan = require('../models/Loan')

router.get('/', (req, res) => res.render('loan'))


router.get('/create', async(req, res) => {

    try {
        const dealers = await Dealer.find().select('name')
        const emps = await Employee.find().select('name')
        return res.render('loan/create', { dealers, emps })
    } catch (error) {
        return res.status(404).render('error')
    }
})


router.post('/create', async(req, res) => {
    const { amount, id } = req.body
    let w_id = id.split("|")[0]
    let ref = id.split("|")[1]
    let name = id.split("|")[2]
    let now = new Date(Date.now())
    try {
        const loan = new Loan({
            ref,
            amount,
            change: amount,
            id: w_id,
            name,
            date_added: now
        })
        await loan.save()
        res.status(201).redirect("/loan")

    } catch (error) {
        return res.status(404).render('error')
    }
})




router.get('/list', async(req, res) => {
    try {
        const loans = await Loan.find().sort("-_id")

        return res.status(201).render('loan/list', { loans })

    } catch (error) {
        return res.status(404).render('error')
    }
})

router.get('/edit/:id', async(req, res) => {
    try {
        const loan = await Loan.findById(req.params.id)
        if (loan) return res.status(201).render('loan/edit', {
            name: loan.name,
            _id: loan._id,
            amount: loan.amount,
            change: loan.change || loan.amount,
            add: loan.add || [0],
            sub: loan.sub || [0],
        })
        else throw new Error("no data found")
    } catch (error) {
        return res.status(404).render('error')
    }
})
router.get('/edit', async(req, res) => res.status(201).redirect('/loan/list'))




router.post('/edit', async(req, res) => {
    let { amount, id, sub, add, change } = req.body

    let adds = add.reduce((a, b) => parseFloat(a) + parseFloat(b), 0)

    let subs = sub.reduce((a, b) => parseFloat(a) + parseFloat(b), 0)

    let updated_change = parseFloat(amount) + parseFloat(adds) - parseFloat(subs)

    try {
        await Loan.updateOne({ _id: id }, {
            $set: {
                add,
                sub,
                change: updated_change
            }
        })
        return res.status(201).redirect('/loan/list')
    } catch (error) {
        return res.status(404).render('error')
    }
})






module.exports = router