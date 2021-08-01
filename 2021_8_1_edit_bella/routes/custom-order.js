const { isAdmin, isSales, isBoth } = require('../middlewares/auth')
const Order = require('../models/orders')

const router = require('express').Router()

router.get('/', isBoth, (req, res) => res.render('custom-orders'))
router.get('/create', isSales, (req, res) => res.render('custom-orders/create'))
router.post('/create', isSales, async(req, res) => {

    const { name, phone, location, date, deliver,  orders } = req.body
    try {
        const order = new Order({
            name,
            phone,
            location,
            date,
            deliver,
            
            orders
        })
        const { _id } = await order.save()

        return res.status(200).send({ link: '/orders/view/' + _id })
    } catch (error) {
        return res.render("error")
    }
})

router.get('/view', isAdmin, async(req, res) => {
    Order.find({})
        .sort('-_id')
        .then((result) => {
            return res.render('custom-orders/view', { orders: result })
        })
        .catch(err => {
            return res.status(404).send(err.message)
        })
})
router.get('/view/:id', isSales, async(req, res) => {
    try {
        const order = await Order.findById(req.params.id)
        if (order) {
            return res.status(200).render('custom-orders/order', { order })
        } else throw new Error('no order found')
    } catch (error) {
        return res.status(404).send(err.message)
    }
})
router.get('/edit/:id',  isAdmin, async(req, res) => {
    try {
        const order = await Order.findById(req.params.id)
        if (order) {
            return res.status(200).render('custom-orders/edit', { order })
        } else throw new Error('no order found')
    } catch (error) {
        return res.status(404).send(err.message)
    }
})


router.post('/update', isSales, async(req, res) => {

    const { name, phone, location, date, deliver,  orders , id } = req.body
    try {
        await Order.updateOne({_id: id}, { $set: {name , phone, location, date, deliver,  orders} })
        return res.status(200).send({link : "/orders/view"})
    } catch (error) {
        return res.render(error)
    }
})




module.exports = router