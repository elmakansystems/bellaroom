const InvProduct = require('../models/InvProduct')
const Product = require('../models/product')

const router = require('express').Router()

router.get('/', (req, res) => res.render('products'))

router.get('/new_product', (req, res) => res.render('products/new_product'))
router.get('/new_part', (req, res) => res.render('products/new_part'))

router.post('/new', async(req, res) => {
    const { names, dealers, phones, prices,part_type } = req.body

    let now = new Date(Date.now())

    try {
        for (let index = 0; index < names.length; index++) {
            let product_data = {
                name: names[index],
                dealer: dealers[index],
                phone: phones[index],
                price: prices[index],
                p_type:part_type[index],
                now
            }

            const product = await new Product(product_data)
            await product.save()

        }

        return res.status(201).redirect('/products')
    } catch (error) {
        return res.status(404).render('error')
    }


})


router.get('/view_products', (req, res) => {
    Product.find({})
        .then((result) => {
            return res.render('products/view_products', { products: result })
        })
        .catch(err => {

            return res.status(404).render('error')

        })
})

router.get('/view_products/:id', async(req, res) => {

    try {
        const product = await Product.findById(req.params.id)
        const sold_products = await InvProduct.find({ product_id: req.params.id })

        if (product) {

            return res.status(200).render('products/product_details', { product, sold: sold_products })
        } else throw new Error('no product found')
    } catch (error) {


        return res.status(404).render('error')
    }

})

router.get('/product/edit/:id/:soldID', async(req, res) => {
    try {
        const product = await Product.findById(req.params.id)
        const sold_products = await InvProduct.find({ _id: req.params.soldID })
        return res.status(201).render('products/edit_m', {product ,sold: sold_products})
    } catch (error) {
        return res.status(404).render('error')
    }
    
})
router.post('/single/edit', async(req, res) => {
    
    const { id, soldID:_id,name, dealer, current_price, sold ,date_added   } = req.body

    const inv = await InvProduct.findById(_id)
    try {
        await InvProduct.updateOne({ _id }, { $set: { current_price, sold   } })
        await Product.updateOne({ _id :id }, { $set: { dealer, name ,date_added  } })
        
        return res.status(201).redirect('/products/view_products/'+id)
    } catch (error) {
        return res.status(404).render('error')
    }
})

router.get('/single/edit', (req, res) => res.redirect('/products/view_products'))

router.get('/edit/:id', async(req, res) => {
    try {
        const product = await Product.findById(req.params.id)

        return res.status(201).render('products/edit', { product })
    } catch (error) {
        return res.status(404).render('error')
    }
})

router.post('/edit', async(req, res) => {
    const { id: _id, dealers, names, phones, prices } = req.body
    try {

        let dealer = dealers[0]
        let name = names[0]
        let phone = phones[0]
        let price = prices[0]

        await Product.updateOne({ _id }, { $set: { dealer, name, phone, price } })

        return res.status(201).redirect('/products/view_products')
    } catch (error) {
        return res.status(404).render('error')
    }
})

router.get('/edit', (req, res) => res.redirect('/products/view_products'))


module.exports = router