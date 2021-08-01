const { underline } = require('colors')
const Expenses = require('../models/Expenses')
const Addition = require('../models/Addition')
const Material = require('../models/Material')

const router = require('express').Router()





router.get('/', (req, res) => res.render('purchases'))

router.get('/m/new', (req, res) => res.render('purchases/new_m'))



router.get('/p/new', (req, res) => res.render('purchases/new_p'))
router.get('/a/new', (req, res) => res.render('purchases/new_a'))




router.get('/m/edit/:id', async(req, res) => {
    try {
        const material = await Material.findById(req.params.id)
        return res.status(201).render('purchases/edit_m', material)
    } catch (error) {
        return res.status(404).render('error')
    }
})



router.get('/p/edit/:id', async(req, res) => {

    try {
        const exp = await Expenses.findById(req.params.id)
        return res.status(201).render('purchases/edit_p', { exp })
    } catch (error) {
        return res.status(404).render('error')
    }
})
router.get('/a/edit/:id', async(req, res) => {

    try {
        const add = await Addition.findById(req.params.id)
        return res.status(201).render('purchases/edit_a', { add })
    } catch (error) {
        return res.status(404).render('error')
    }
})

router.post('/m/edit', async(req, res) => {
    const { id: _id, dealer, name, phone, unit, total } = req.body
    try {
        await Material.updateOne({ _id }, { $set: { dealer, name, phone, unit, total } })
        return res.status(201).redirect('/purchases/m/view')
    } catch (error) {
        return res.status(404).render('error')
    }
})

router.get('/m/edit', (req, res) => res.redirect('/purchases/m/view'))


router.post('/p/edit', async(req, res) => {
    const { _id, text, amount, serial } = req.body
    try {
        await Expenses.updateOne({ _id }, { $set: { text, amount, serial } })
        return res.status(201).redirect('/purchases/p/view')
    } catch (error) {
        return res.status(404).render('error')
    }
})
router.post('/a/edit', async(req, res) => {
    const { _id, text, amount, serial } = req.body
    try {
        await Addition.updateOne({ _id }, { $set: { text, amount, serial } })
        return res.status(201).redirect('/purchases/a/view')
    } catch (error) {
        return res.status(404).render('error')
    }
})



router.get('/p/edit', (req, res) => res.redirect('/purchases/p/view'))
router.get('/a/edit', (req, res) => res.redirect('/purchases/a/view'))

router.get('/m/', (req, res) => res.redirect('/purchases/m/view'))
router.get('/a/', (req, res) => res.redirect('/purchases/a/view'))

router.post('/m/new', async(req, res) => {




    const { data: { names, dealers, phones, units, totals }, isExp } = req.body

    let now = new Date(Date.now())
    if (!isExp) {
        try {
            names.forEach(async(d, i) => {
                let mat = {
                    name: names[i],
                    dealer: dealers[i],
                    phone: phones[i],
                    unit: units[i],
                    total: totals[i],
                    now
                }
                const material = await new Material(mat)
                const result = await material.save()

            });
            return res.status(201).send('/purchases/m/view')
        } catch (error) {
            return res.status(400).render('error')
        }
    } else {
        let texts = [...names]
        let amounts = [...totals]
        try {
            let mats_arr = []
            names.forEach(async(d, i) => {
                let mat = {
                    name: names[i],
                    dealer: dealers[i],
                    phone: phones[i],
                    unit: units[i],
                    total: totals[i],
                    now
                }
                const material = await new Material(mat)
                const { _id } = await material.save()
                mats_arr.push(_id)

            });
            let expss_arr = []
            texts.forEach(async(d, i) => {
                let exps = {
                    serial: i,
                    text: texts[i],
                    amount: amounts[i],
                    now
                }
                const exp = await new Expenses(exps)
                const { _id } = await exp.save()
                expss_arr.push(_id)
                if (expss_arr.length === mats_arr.length) {
                    return res.status(201).send('/purchases/m/view')
                }
            });

        } catch (error) {
            return res.status(400).render('error')
        }


    }


})

router.post('/p/new', async(req, res) => {


    const now = new Date(Date.now())
    const { serial, amount, text } = req.body

    try {
        const expenses = new Expenses({ serial, amount, text, date_added: now })
        await expenses.save()

        return res.status(201).redirect("/purchases/p/view")
    } catch (error) {
        return res.status(404).render('error')
    }

})
router.post('/a/new', async(req, res) => {


    const now = new Date(Date.now())
    const { serial, amount, text } = req.body

    try {
        const addition = new Addition({ serial, amount, text, date_added: now })
        await addition.save()

        return res.status(201).redirect("/purchases/a/view")
    } catch (error) {
        return res.status(404).render('error')
    }

})

router.get('/m/view', async(req, res) => {
    try {
        const mats = await Material
            .find()
            .select("-__v")
            .sort("-_id")
        return res.status(201).render('purchases/view_m', { mats })

    } catch (error) {
        return res.status(404).render('error')
    }
})


router.get('/p/view', async(req, res) => {
    try {
        const exps = await Expenses.find().sort("-_id")
        return res.status(201).render('purchases/view_p', { exps })
    } catch (error) {
        return res.status(404).render('error')
    }
})
router.get('/a/view', async(req, res) => {
    try {
        const exps = await Addition.find().sort("-_id")
        return res.status(201).render('purchases/view_a', { exps })
    } catch (error) {
        return res.status(404).render('error')
    }
})







module.exports = router