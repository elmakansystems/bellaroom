const Invoice = require('../models/invoice')


module.exports.get_all_receipts = async(req, res) => {
    try {
        const invoices = await Invoice.find().sort("-_id")
        res.status(200).render('receipt/view', { invoices })
    } catch (error) {
        console.log(`> Error while retrieving data : ${error.message}`.red);
    }

}

module.exports.get_single_receipt = (req, res) => {

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
                        total: v.inv_total
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
                id: result.invId || result._id
            }
            res.render('receipt', { inv })


        })
        .catch(err => res.render('error', { error: err.message }))
}