const { isBoth, isAdmin } = require('../middlewares/auth')
const Attend = require('../models/Attend')
const Day = require('../models/Day')
const dealer = require('../models/dealer')
const Employee = require('../models/Employee')

const router = require('express').Router()

router.get('/', isBoth, (req, res) => {

    let { admin, editor } = req.user_type
    res.render('attendance', { admin, editor })

})

router.get('/today', isBoth, async(req, res) => {
    try {
        const dealers = await dealer.find({ isActive: true }).select('_id name')
        const emps = await Employee.find({ isActive: true }).select('_id name')
        if (dealers && emps) return res.render('attendance/today', { dealers, emps })
    } catch (error) {
        return res.render("error")
    }
})

router.post('/today', isBoth, async(req, res) => {
    const { data, date } = req.body
    let t = new Date(date)
    let start = new Date(t.setHours(0, 0, 0, 0))
    let end = new Date(t.setHours(23, 59, 59, 999))

    let at = new Date(date).toLocaleDateString('ar-EG')
    let now = new Date(new Date(date).setHours(10,0,0,0))
    try {
        const today = await Day.find({ dateReg: { $gte: start, $lte: end } }).sort("-_id")
        if (today.length !== 0) {
            return res.status(201).send("already taken")
        } else {
            let _ids = []
            data.forEach(async(d) => {
                const attend = new Attend({
                    name: d.name,
                    user_id: d.id,
                    attend: d.attend,
                    dateAdded: now,
                    date_at: at
                })
                let { _id } = await attend.save()
                _ids.push(_id)
                if (_ids.length === data.length) {
                    const day = new Day({
                        at,
                        dateReg: now,
                        attends: _ids,
                    })
                    const result = await day.save()

                    return res.status(201).send({ link: "/attendance/view/" + result.at })
                }
            });
        }
    } catch (error) {
        return res.render('error')
    }

})


router.get('/all', isAdmin, async(req, res) => {
    let d = new Date()
    let start = new Date(d.getFullYear(), d.getMonth(), 1)
    let end = new Date(d.getFullYear(), d.getMonth(), 31)
    try {
        const days = await Day.find({ dateReg: { $gte: start, $lte: end } }).select('at -_id').sort('-at')
        return res.render('attendance/days', { days })

    } catch (error) {
        return res.render("error")
    }
})

router.post('/all', isAdmin, async(req, res) => {
    const { day, month, year } = req.body
    if (day === 'all') {
        let start = new Date(year, month, 1)
        let end = new Date(year, month, 31)
        try {
            const days = await Day.find({ dateReg: { $gte: start, $lte: end } }).select('at -_id').sort('-at')
            if (days.length > 0) return res.send(days)
            else throw new Error("no data found")
        } catch (error) {
            return res.render("error")
        }
    } else {
        let start = new Date(new Date(year, month, day).setHours(0, 0, 0, 0))
        let end = new Date(new Date(year, month, day).setHours(23, 59, 59, 999))
        try {
            const days = await Day.find({ dateReg: { $gte: start, $lte: end } }).select('at -_id').sort('dateReg')
            if (days.length < 1) return res.status(400).send('no data')
            return res.status(201).send(days)

        } catch (error) {
            return res.render("error")
        }
    }

})

router.post('/edit', isAdmin, (req, res) => {
    const { data } = req.body
    try {
        data.forEach(d => {
            attend_doc_updater(d.id, d.attend)
        });
        return res.send('/attendance/all')
    } catch (error) {
        return res.send('error')
    }
})

router.get('/view/:y/:m/:d', isBoth, async(req, res) => {
    let { y, m, d } = req.params
    let at = `${y}/${m}/${d}`
    try {
        const data = await Attend.find({ date_at: at }).select('-_id name attend')
        if (data && data.length > 0) return res.render('attendance/view', { data, at })
        else return res.status(400).render("error")
    } catch (error) {
        return res.render("error")
    }
})


router.get('/edit/:y/:m/:d', isAdmin, async(req, res) => {
    let { y, m, d } = req.params
    let at = `${y}/${m}/${d}`
    try {
        const data = await Attend.find({ date_at: at }).select('name attend')
        if (data && data.length > 0) return res.render('attendance/edit', { data, at })
        else return res.status(400).render("error")
    } catch (error) {
        return res.render("error")
    }
})



const attend_doc_updater = async(id, state) => {
    try {
        await Attend.updateOne({ _id: id }, { $set: { attend: state } })
    } catch (error) {
        return error
    }
}



module.exports = router