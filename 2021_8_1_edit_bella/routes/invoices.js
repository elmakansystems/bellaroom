const router = require('express').Router()
const product = require('../models/product')
const dealer = require('../models/dealer')
const InvProduct = require('../models/InvProduct')
const Invoice = require('../models/invoice')
const { get_all_invoices, get_single_invoice } = require('../controllers/invoice')
const invoice = require('../models/invoice')
const { isAdmin, isSales, isBoth } = require('../middlewares/auth')

router.get('/', isBoth, get_all_invoices)
router.get('/edit/:id', isAdmin, async(req, res) => {
    // code here
    try {
        const invoice = await Invoice.findById(req.params.id).populate('inv_products products dealer')

        let inv_data = {
            _id: invoice._id,
            name: invoice.name,
            location: invoice.location,
            phone: invoice.phone,
            paid: invoice.paid,
            change: invoice.change,
            date_added: invoice.date_added,
            invId: invoice.invId,
            comment: invoice.comment,
            total_discount: invoice.total_discount,
            total_percentage: invoice.total_percentage,
            total_price: invoice.total_price,
            total_total: invoice.total_total,
            _id: invoice._id,
            dealer: invoice.dealer.name,
            dealer_id: invoice.dealer._id,
            regProducts: invoice.products.map(v => {
                return {
                    name: v.name,
                    price: v.price,
                    p_type:v.p_type,
                    _id: v._id
                }
            }),
            regInvProducts: invoice.inv_products.map(v => {
                return {
                    price: v.inv_price,
                    discount: v.inv_discount,
                    percent: v.inv_percent,
                    total: v.inv_total,
                    warranty: v.inv_warranty,
                    id: v._id
                }
            }),
        }


        const products = await product.find({p_type: 'collection' , p_type: null}).select('name price p_type')
        const all = await product.find().select('name price p_type')
        const parts = await product.find({p_type: 'part'}).select('name price p_type')
        const dealers = await dealer.find().select('name')
        const serial = await Invoice.find().countDocuments() + 1 || 0
        res.status(201).render('invoices/edit', { products, dealers, serial, inv_data ,parts , all})


    } catch (error) {
        return res.status(404).render("error")
    }
})


router.get('/create', isSales, async(req, res) => {
    try {
        const products = await product.find({p_type: 'collection' }).select('name price')
        const old_products = await product.find({ p_type: null}).select('name price')
        const parts = await product.find({p_type: 'part'}).select('name price')
        
        const dealers = await dealer.find().select('name')
        const serial = await Invoice.find().countDocuments() + 1 || 0
        

        const old_serial = await Invoice.find({invId: serial})
       
        res.status(201).render('invoices/create', { products, dealers, serial ,parts , old_serial , old_products})
    } catch (error) {
        return res.status(404).render("error")
    }
})

router.post('/create_new', isSales,async (req, res) => {
    const serial = await Invoice.find().countDocuments() + 1 || 0
        
    let now = new Date(Date.now())
    const {
        number,
        name,
        dealer,
        phone,
        location,
        products,
        comment,
        total_total,
        total_discount,
        total_percentage,
        total_price,
        total,
        percentage,
        discount,
        warranty,
        price,
        paid,
        change,
        receive
    } = req.body


    let ids = []
    products.forEach(async(p, i) => {
        let inv_product_obj = {
            product_id: products[i].split("|")[0],
            current_price: products[i].split("|")[1],
            inv_warranty: warranty[i],
            inv_price: price[i],
            inv_discount: discount[i],
            inv_percent: percentage[i],
            inv_total: total[i],
            date_added: now
        }
        try {
            const invproduct = new InvProduct(inv_product_obj)
            const { _id } = await invproduct.save()
            ids.push(_id)
            if (ids.length === products.length) {
                try {
                    const invoice = new Invoice({
                        invId: serial,
                        name,
                        dealer,
                        phone,
                        location,
                        comment,
                        total_total,
                        total_discount,
                        total_percentage,
                        total_price,
                        products: products.map(p => p.split("|")[0]),
                        inv_products: ids,
                        date_added: now,
                        paid,
                        change,
                        receive,

                    })
                    await invoice.save()
                    return res.status(201).redirect("/invoices")
                } catch (error) {
                    return res.status(404).render('error')
                }
            }
        } catch (error) {
            return res.status(404).render('error')
        }
    });
})


router.post('/update', isAdmin, (req, res) => {
    let now = new Date(Date.now())
    const {
        _id_inv,
        inv_products_ids,
        number,
        name,
        dealer,
        phone,
        location,
        products,
        comment,
        total_total,
        total_discount,
        total_percentage,
        total_price,
        total,
        percentage,
        discount,
        warranty,
        price,
        paid,
        change,
        receive
    } = req.body




    let del = []
    inv_products_ids.forEach(async(h) => {
        const result = await InvProduct.deleteOne({ _id: h })
        del.push(result.ok)
        if (del.length === inv_products_ids.length) {
            let ids = []
            products.forEach(async(p, i) => {
                let inv_product_obj = {
                    product_id: products[i].split("|")[0],
                    current_price: products[i].split("|")[1],
                    inv_warranty: warranty[i],
                    inv_price: price[i],
                    inv_discount: discount[i],
                    inv_percent: percentage[i],
                    inv_total: total[i],
                    date_added: now
                }
                try {
                    const invproduct = new InvProduct(inv_product_obj)
                    const { _id } = await invproduct.save()
                    ids.push(_id)
                    if (ids.length === products.length) {
                        try {
                            const invoice = await Invoice.findById(_id_inv)
                            if (!invoice) throw Error('no such invoice')
                            invoice.set({
                                invId: number,
                                name,
                                dealer,
                                phone,
                                location,
                                comment,
                                total_total,
                                total_discount,
                                total_percentage,
                                total_price,
                                products: products.map(p => p.split("|")[0]),
                                inv_products: ids,
                                paid,
                                change,
                                receive,
                            })
                            await invoice.save()
                            return res.status(201).redirect("/invoices")
                        } catch (error) {
                            return res.status(404).render('error')
                        }
                    }
                } catch (error) {
                    return res.status(404).render('error')
                }
            });
        }
    });

})

// router.get('/edit/:id', async(req, res) => {
//     const inv = await invoice.findById(req.params.id)
//     console.log(inv);
// })


router.get('/:id', isSales, get_single_invoice)






module.exports = router