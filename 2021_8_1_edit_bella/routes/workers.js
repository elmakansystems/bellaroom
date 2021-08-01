const Bill = require('../models/Bill')
const Dealer = require('../models/dealer')
const Employee = require('../models/Employee')
const router = require('express').Router()
const { ar_date_splitted } = require('../helpers/date-format')
const EBill = require('../models/EBill')
const invoice = require('../models/invoice')
const { isAdmin } = require('../middlewares/auth')
const User = require('../models/User')
const Attend = require("../models/Attend")
const Loan = require("../models/Loan")


router.get('/', isAdmin, (req, res) => res.render('workers'))
router.get('/d/create', isAdmin, async(req, res) => {

    try {
        const users = await User.find().select("name")
        res.render('workers/d_create', { users })

    } catch (error) {

    }




})
router.post('/d/create', isAdmin, async(req, res) => {
    const { d_name: name, d_phone: phone, d_location: location, d_date: date, d_n_id: n_id, d_salary: salary, d_comm: comm, d_comment: comment, user } = req.body
    try {
        const dealer = new Dealer({ name, phone, location, date, n_id, salary, comm, comment })

        const result = await dealer.save()
        if (result) {

            await User.updateOne({ _id: user }, { $set: { id: result._id, ref: 'd' } })
            return res.status(200).redirect('/workers')
        }
    } catch (error) {

        return res.render('error')
    }
})
router.get('/e/create', isAdmin, (req, res) => res.render('workers/e_create'))
router.post('/e/create', isAdmin, async(req, res) => {

    let { e_name: name, e_phone: phone, e_location: location, e_date: date, e_n_id: n_id, e_salary: salary, e_comment: comment } = req.body
    salary = parseFloat(salary)
    try {
        const employee = new Employee({ name, phone, location, date, n_id, salary, comment })
        await employee.save()
        res.status(200).redirect('/workers')

    } catch (error) {
        return res.render('error')
    }
})
router.get('/d', isAdmin, (req, res) => {
    Dealer.find({})
        .sort('-_id')
        .then((result) => res.render('workers/d_view', { dealers: result }))
        .catch(err => res.status(404).send(err.message))
})
router.get('/e', isAdmin, (req, res) => {
    Employee.find({})
        .sort({ salary: -1 }).limit(50)
        .then((result) => res.render('workers/e_view', { employees: result }))
        .catch(err => res.status(404).send(err.message))
})
router.get('/e/edit/', isAdmin, (req, res) => res.status(200).redirect('/workers/e'))
router.get('/d/edit/', isAdmin, (req, res) => res.status(200).redirect('/workers/d'))
router.get('/e/edit/:id', isAdmin, async(req, res) => {
    try {
        const emp = await Employee.findById(req.params.id)
        if (emp) {
            return res.status(200).render('workers/e_edit', { emp })
        } else throw new Error('no such employee ')
    } catch (error) {

        return res.render('error')
    }
})
router.post('/e/edit/', isAdmin, async(req, res) => {
    const { id, e_name: name, e_phone: phone, e_location: location, e_date: date, e_n_id: n_id, e_salary: salary, e_comment: comment } = req.body
    try {
        const emp = await Employee.findById(id)
        emp.set({ name, phone, location, date, n_id, salary, comment })
        await emp.save()
        return res.status(200).redirect('/workers/e')
    } catch (error) {


        return res.render('error')
    }
})
router.get('/d/edit/:id', isAdmin, async(req, res) => {
    try {
        const dealer = await Dealer.findById(req.params.id)
        if (dealer) {
            return res.status(200).render('workers/d_edit', { dealer })
        } else throw new Error('no such dealer ')
    } catch (error) {
        return res.render('error')
    }
})
router.post('/d/edit/', isAdmin, async(req, res) => {
    const { id, d_name: name, d_phone: phone, d_location: location, d_date: date, d_n_id: n_id, d_salary: salary, d_comm: comm, d_comment: comment } = req.body
    try {
        const dealer = await Dealer.findById(id)
        dealer.set({ name, phone, location, date, n_id, comm, salary, comment })
        await dealer.save()
        return res.status(200).redirect('/workers/d')
    } catch (error) {


        return res.render('error')
    }
})
router.post('/d/calcs/', isAdmin, async(req, res) => {
    const { id: dealer_id, n_id, _add, add, _sub, sub, total,year , month , name } = req.body
    let date = new Date(year , month ,10 )
    let dateAdded = date.toLocaleDateString('ar-EG-u-nu-latn')
        monthReg =  date.toLocaleDateString('ar-EG-u-nu-latn' , {month : 'short'}),
        yearReg = date.toLocaleDateString('ar-EG-u-nu-latn' , {year : 'numeric'}),
        timeReg = date.toLocaleTimeString('ar-EG-u-nu-latn')
   

        
    try {
        const bill = new Bill({ dealer_id, n_id, _add,
             add, _sub, sub, total, name, dateAdded, monthReg, yearReg, timeReg , date })
        await bill.save()
        res.status(201).send(`/workers/d/calcs/${dealer_id}/`)
    } catch (error) {
        return res.render('error')
    }
})
router.post('/e/calcs/', isAdmin, async(req, res) => {
    const { id: emp_id, n_id, _add, add, _sub, sub, total, name , year , month  } = req.body
    
    let date = new Date(year , month ,10 )
    let dateAdded = date.toLocaleDateString('ar-EG')
        monthReg =  date.toLocaleDateString('ar-EG' , {month : 'short'}),
        yearReg = date.toLocaleDateString('ar-EG' , {year : 'numeric'}),
        timeReg = date.toLocaleTimeString('ar-Eg')
    

    try {
        const bill = new EBill({ date , emp_id, n_id, _add, add, _sub, sub, total, name, dateAdded, monthReg, yearReg, timeReg })
        await bill.save()
        res.status(201).send(`/workers/e/calcs/${emp_id}/`)
    } catch (error) {
        return res.render('error')
    }
})
router.post('/e/deactivate', isAdmin, async(req, res) => {
    try {
        const employee = await Employee.findById(req.body.id)
        if (employee) {
            let activeState = employee.isActive
            employee.set({ isActive: !activeState })
            await employee.save()
            return res.status(200).send('deactivated')
        }
    } catch (error) {
        return res.render('error')
    }
})
router.post('/d/deactivate', isAdmin, async(req, res) => {
    try {
        const dealer = await Dealer.findById(req.body.id)
        if (dealer) {
            let activeState = dealer.isActive
            dealer.isActive = !activeState;
            await dealer.save()
            return res.status(200).send('deactivated')
        }
    } catch (error) {
        return res.render('error')
    }
})
router.get('/d/calcs/:id', isAdmin, async(req, res) => {
    try {
        const dealer = await Dealer.findById(req.params.id)
        const bills = await Bill.find({ dealer_id: req.params.id }).sort('-_id')
        if (dealer) {
            return res.status(201).render('workers/d_calcs', { dealer, bills })
        } else throw new Error('no order found')
    } catch (error) {
        return res.render('error')
    }
}) 
router.get('/e/calcs/:id', isAdmin, async(req, res) => {
    try {
        const emp = await Employee.findById(req.params.id)
        const bills = await EBill.find({ emp_id: req.params.id }).sort('-_id')
        if (emp) {
            return res.status(201).render('workers/e_calcs', { emp, bills })
        } else throw new Error('no order found')
    } catch (error) {
        return res.render('error')
    }
})
router.get('/d/calcs/:id/edit/:bill_id', isAdmin, async(req, res) => {
    
    try {
        const bill = await Bill.findById(req.params.bill_id)
        const dealer = await Dealer.findById(req.params.id)
        
        if (bill && dealer) {
            return res.status(201).render('workers/b_edit', { dealer, bill })
        } else throw new Error('no bill found')
    } catch (error) {
        return res.render('error')
    }
})
router.post('/d/calcs/bill/edit/', isAdmin, async(req, res) => {
    const { d_id, b_id, _add, add, _sub, sub, total } = req.body
    let dateMod = ar_date_splitted().time
    try {
        const bill = await Bill.findById(b_id)
        bill.set({
            dateMod,
            _add,
            add,
            _sub,
            sub,
            total,
        })
        await bill.save()
        res.status(201).send(`/workers/d/calcs/${d_id}/`)
    } catch (error) {
        return res.render('error')
    }
})
router.get('/e/calcs/:id/edit/:bill_id', isAdmin, async(req, res) => {
    try {
        const bill = await EBill.findById(req.params.bill_id)
        const emp = await Employee.findById(req.params.id)
        if (bill && emp) {
            return res.status(201).render('workers/be_edit', { emp, bill })
        } else throw new Error('no bill found')
    } catch (error) {
        return res.render('error')
    }
})
router.post('/e/calcs/bill/edit/', isAdmin, async(req, res) => {
    const { e_id, b_id, _add, add, _sub, sub, total } = req.body
    let dateMod = ar_date_splitted().time
    try {
        const bill = await EBill.findById(b_id)
        bill.set({
            dateMod,
            _add,
            add,
            _sub,
            sub,
            total,
        })
        await bill.save()
        res.status(201).send(`/workers/e/calcs/${e_id}/`)
    } catch (error) {
        return res.render('error')

    }
})
router.get('/d/calcs/:id/view/:bill_id', isAdmin, async(req, res) => {
    try {
        const bill = await Bill.findById(req.params.bill_id)
        const dealer = await Dealer.findById(req.params.id)
        if (bill && dealer) {
            return res.status(201).render('workers/b_view', { id: dealer._id, name: dealer.name, bill })
        } else throw new Error('no bill found')
    } catch (error) {
        return res.render('error')
    }
})
router.get('/e/calcs/:id/view/:bill_id', isAdmin, async(req, res) => {
    try {
        const bill = await EBill.findById(req.params.bill_id)
        const emp = await Employee.findById(req.params.id)
        if (bill && emp) {
            return res.status(201).render('workers/be_view', { id: emp._id, name: emp.name, bill })
        } else throw new Error('no bill found')
    } catch (error) {
        return res.render('error')
    }
})



router.get('/d/calcs/:id/create/', isAdmin, require('../controllers/employee').current_month_data_d)



router.get('/d/calcs/:id/create/get',isAdmin, (req, res) => res.status(201).redirect('/d_bill'))

router.post('/d/calcs/:id/create/get',isAdmin, require('../controllers/employee').specific_data_range_d)






router.get('/e/calcs/:id/create', isAdmin, async(req, res) => {
    try {
        const emp = await Employee.findById(req.params.id)
        if (emp) {
            return res.status(201).render('workers/e_bill', { emp })
        } else throw new Error('no order found')
    } catch (error) {
        return res.render('error')
    }


})
router.get('/d/calcs', isAdmin, (req, res) => res.status(201).redirect('/workers/d'))
router.get('/e/calcs', isAdmin, (req, res) => res.status(201).redirect('/workers/e'))
router.get('/e/deactivated', isAdmin, async(req, res) => {
    try {
        const employee = await Employee.find({ isActive: false })
        if (employee) {
            return res.status(200).render('workers/e_deactive', { employee })
        } else throw new Error('no order found')
    } catch (error) {
        return res.render('error')
    }
})
router.get('/d/deactivated', isAdmin, async(req, res) => {
    try {
        const dealers = await Dealer.find({ isActive: false })
        if (dealers) {
            return res.status(200).render('workers/d_deactive', { dealers })
        } else throw new Error('no order found')
    } catch (error) {
        return res.render('error')
    }
})
router.get('/d/:id', async(req, res) => {
    try {
        let d = new Date(Date.now())
        let start = new Date(new Date(d.getFullYear(), d.getMonth(), d.getDate()).setHours(0, 0, 0, 0))
        let end = new Date(new Date(d.getFullYear(), d.getMonth(), d.getDate()).setHours(23, 59, 59, 999))
        let start_month = new Date(d.getFullYear(), d.getMonth(), 1)
        let end_month = new Date(new Date(new Date(d.getFullYear(), d.getMonth() + 1, 0)).setHours(23, 59, 59, 999))
        const reg_absent_days = await Attend.find({ user_id: req.params.id, attend: false, dateAdded: { $gte: start_month, $lte: end_month } }).select('date_at') || []
        const absent_days = reg_absent_days.length || 0
        let attend
        reg_absent_days && reg_absent_days.length > 0 ? attend = await Attend.find({ user_id: req.params.id, dateAdded: { $gte: start, $lte: end } }).select('attend -_id')[0].attend || true : attend = true
        
        const sold_inv = await invoice.find({ dealer: req.params.id , date_added: { $gte: start_month, $lte: end }}).select('total_price date_added').sort('-_id')
        const dealer = await Dealer.findById(req.params.id)
        const loan = await Loan.find({ id: req.params.id }).select('change -_id')

        let loan_sum = loan.map(v => v.change).reduce((a, b) => a + b, 0) || 0
        if (dealer) {
            return res.status(200).render('workers/d_profile', { dealer, sold_inv, absent_days, isAttend: attend, reg_absent_days, loan_sum })
        } else throw new Error('no order found')
    } catch (error) {

        return res.render('error')
    }
})
router.get('/e/:id', async(req, res) => {
    try {
        let d = new Date(Date.now())
        let start = new Date(new Date(d.getFullYear(), d.getMonth(), d.getDate()).setHours(0, 0, 0, 0))
        let end = new Date(new Date(d.getFullYear(), d.getMonth(), d.getDate()).setHours(23, 59, 59, 999))
        let start_month = new Date(d.getFullYear(), d.getMonth(), 1)
        let end_month = new Date(new Date(new Date(d.getFullYear(), d.getMonth() + 1, 0)).setHours(23, 59, 59, 999))
        const reg_absent_days = await Attend.find({ user_id: req.params.id, attend: false, dateAdded: { $gte: start_month, $lte: end_month } }).select('date_at') || ['']
        const absent_days = reg_absent_days.length || 0
        let attend
        reg_absent_days && reg_absent_days.length > 0 ? attend = await Attend.find({ user_id: req.params.id, dateAdded: { $gte: start, $lte: end } }).select('attend -_id')[0].attend || true : attend = true



        const employee = await Employee.findById(req.params.id)
        const loan = await Loan.find({ id: req.params.id }).select('change -_id')
        let loan_sum = loan.map(v => v.change).reduce((a, b) => a + b, 0) || 0
        if (employee) {
            return res.status(200).render('workers/e_profile', { emp: employee, absent_days, isAttend: attend, reg_absent_days, loan_sum })
        } else throw new Error('no order found')
    } catch (error) {
        return res.render('error')
    }
})



module.exports = router