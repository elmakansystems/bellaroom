const invoice = require("../models/invoice")
const Expenses = require("../models/Expenses")
    // أيمن
const Addition = require("../models/Addition")
const Product = require("../models/product")
const Bill = require("../models/Bill")
const EBill = require("../models/EBill")
const Loan = require("../models/Loan")
const InvProduct = require("../models/InvProduct")

exports.current_month_data = async(req, res) => {

    
    try {
        let d = new Date(Date.now())
        let start = new Date(d.getFullYear(), d.getMonth(), 1)
        let end = new Date(new Date(new Date(d.getFullYear(), d.getMonth() + 1, 0)).setHours(23, 59, 59, 999))
        const products = await Product.find()
        let products_array = []
        products.forEach(element => {
            products_array.push(element._id)
        });
        const sold_products = await InvProduct.find({ product_id : { $in : products_array } , date_added: { $gte: start, $lte: end } })
        const invoices = await invoice.find({ date_added: { $gte: start, $lte: end } })
        res.render('printfile/printfile_view', {
           products,
           sold:sold_products,
           products_array,
           invoices,
            start: start || '',
            end: end || ''
        })
    } catch (error) {
        return res.status(400).render("error")
    }

}

exports.specific_data_range = async(req, res) => {

    const { from_day, to_day, from_month, to_month, from_year, to_year } = req.body

    try {
        let start = new Date(new Date(from_year, from_month, from_day).setHours(0, 0, 0, 0))
        let end = new Date(new Date(to_year, to_month, to_day).setHours(23, 59, 59, 999))
        const products = await Product.find()
        let products_array = []
        products.forEach(element => {
            products_array.push(element._id)
        });
        const sold_products = await InvProduct.find({ product_id : { $in : products_array } , date_added: { $gte: start, $lte: end } })
        const invoices = await invoice.find({ date_added: { $gte: start, $lte: end } })
        res.render('printfile/printfile_view', {
           products,
           sold:sold_products,
           products_array,
           invoices,
            start: start || '',
            end: end || ''
        })
    } catch (error) {
        return res.status(400).render("error")
    }
}