const Invoice = require('../models/invoice')
const Product = require('../models/product')


module.exports.get_all_invoices = async(req, res) => {
    try {
        const invoices = await Invoice.find().sort("-_id")
        res.status(200).render('invoices/view', { invoices })
    } catch (error) {
        console.log(`> Error while retrieving data : ${error.message}`.red);
    }

}

module.exports.get_single_invoice = (req, res) => {

    const inv_id = req.params.id
    Invoice.findById({ _id: inv_id })
        .populate('products inv_products dealer')
        .then(result => {
            let prs = result.products.map(p => p.name)
            let inv = {
                products: result.inv_products.map((v, i) => {
                    return {
                        name: prs[i],
                        price: v.inv_price,
                        discount: v.inv_discount,
                        total: v.inv_total,
                        warranty: v.inv_warranty
                    }
                }),
                dealer: result.dealer.name,
                paid: result.paid,
                change: result.change,
                total_discount: result.total_discount,
                total_price: result.total_price,
                total_percentage: result.total_percentage,
                real_price: result.total_total,
                name: result.name,
                location: result.location,
                phone: result.phone,
                comment: result.comment,
                date: result.date_added,
                receive: result.receive,
                id: result.invId || result._id
            }
            res.render('invoice', { inv })


        })
        .catch(err => res.render('error', { error: err.message }))
}