const invoice = require("../models/invoice")
const Dealer = require('../models/dealer')


exports.current_month_data_d = async(req, res) => {
     try {
        let d = new Date(Date.now())
        let start = new Date(d.getFullYear(), d.getMonth(), 1)
        let end = new Date(new Date(new Date(d.getFullYear(), d.getMonth() + 1, 0)).setHours(23, 59, 59, 999))
        let to_month = end.getMonth() +1
        const dealer = await Dealer.findById(req.params.id)
        const invs = await invoice.find({ dealer: req.params.id , date_added: { $gte: start, $lte: end } }).select('total_price -_id')
        let sum = invs.map(i => i.total_price).reduce((a, b) => a + b, 0) || 0
        if (dealer) {
            return res.status(201).render('workers/d_bill', { dealer, sum , end , start , to_month})
        } else throw new Error('no order found')
    } catch (error) {
        return res.render('error')
    }
}

exports.specific_data_range_d = async(req, res) => {

    const { from_day, to_day, from_month, to_month, from_year, to_year , dealer_id} = req.body
  
    try {
        let start = new Date(new Date(from_year, from_month , 1 ).setHours(0, 0, 0, 0))
        let end = new Date(new Date(from_year, to_month , 1).setHours(23, 59, 59, 999))
        
        const dealer = await Dealer.findById(dealer_id)
        
        const invoices = await invoice.find({ dealer: dealer_id , date_added: { $gte: start, $lte: end } }).select('total_price paid change').sort('-_id')
        let sum = invoices.map(i => i.total_price).reduce((a, b) => a + b, 0) || 0
       
        res.status(201).render('workers/d_bill', {
            invoices,
            dealer,
            sum,
            to_month,
            start: start || '',
            end: end || ''
        })
    } catch (error) {
        return res.status(400).render("error")
    }


}