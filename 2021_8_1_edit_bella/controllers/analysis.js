const Addition = require("../models/Addition")
const Attend = require("../models/Attend")
const Bill = require("../models/Bill")
const Day = require("../models/Day")
const Dealer = require("../models/dealer")
const EBill = require("../models/EBill")
const Employee = require("../models/Employee")
const Expenses = require("../models/Expenses")
const invoice = require("../models/invoice")
const InvProduct = require("../models/InvProduct")
const Loan = require("../models/Loan")
const Material = require("../models/Material")
const Order = require("../models/orders")
const Product = require("../models/product")
    // أيمن


exports.current_month_data = async(req, res) => {

    
    try {
        let d = new Date(Date.now())
        let start = new Date(d.getFullYear(), d.getMonth(), 1)
        let end = new Date(new Date(new Date(d.getFullYear(), d.getMonth() + 1, 0)).setHours(23, 59, 59, 999))


        
        
        
        // بيانات الفواتير خلال الشهر
        // اسأل عن الـــ receive
        const invoices = await invoice.find({ date_added: { $gte: start, $lte: end } }).select('total_price paid change name dealer date_added')
        
        
        // عدد المنتجات في الشهر الحالي
        
        const sold_products = await InvProduct.find({ date_added: { $gte: start, $lte: end }}).select('inv_total product_id date_added')
        // منتحات الشهر الحالي
        const products = await Product.find({ date_added: { $gte: start, $lte: end } }).select('p_type price name date_added').sort('-_id')
        

        
        
        

        // المصاريف و الاضافات
        
        const expenses = await Expenses.find({ date_added: { $gte: start, $lte: end } }).select('amount text').sort('-_id')
        const addition = await Addition.find({ date_added: { $gte: start, $lte: end } }).select('amount text').sort('-_id')
      
                // فلوس الموظفين
        const bills = await Bill.find({ date: { $gte: start, $lte: end } }).select("name total dealer_id").sort('-_id')
        const ebills = await EBill.find({ date: { $gte: start, $lte: end } }).select("name total emp_id").sort('-_id')

        let loans = await Loan.find({ change: { $gt: 0 }, date_added: { $gte: start, $lte: end } }).select("name change").sort('-_id')

        let total_exps = expenses.map(v => v.amount).reduce((a, b) => a + b, 0) + products.map(v => v.price).reduce((a, b) => a + b, 0)
            // أيمن
        let total_add = addition.map(v => v.amount).reduce((a, b) => a + b, 0)

        let total_bills = bills.map(v => v.total).reduce((a, b) => a + b, 0) + ebills.map(v => v.total).reduce((a, b) => a + b, 0)

        let total_loans = loans.map(v => v.change).reduce((a, b) => a + b, 0)

        let totals = {
            paid: invoices.map(elm => elm.paid ? elm.paid : 0).reduce((a, b) => a + b, 0),
            change: invoices.map(elm => elm.change ? elm.change : 0).reduce((a, b) => a + b, 0),
            price: invoices.map(elm => elm.total_price ? elm.total_price : 0).reduce((a, b) => a + b, 0),
        }

        res.render('analysis/analysis_view', {
            invoices,
            totals,
            expenses,
            addition,
            products,
            bills,
            ebills,
            total_exps,
            total_add,
            total_bills,
            total_loans,
            loans,
            sold_products,
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

        const invoices = await invoice.find({ date_added: { $gte: start, $lte: end } }).select('total_price paid change').sort('-_id')
        const addition = await Addition.find({ date_added: { $gte: start, $lte: end } }).select('amount text').sort('-_id')
        const expenses = await Expenses.find({ date_added: { $gte: start, $lte: end } }).select('amount text').sort('-_id')
        const products = await Product.find({ date_added: { $gte: start, $lte: end } }).select('price name').sort('-_id')
        const bills = await Bill.find({ date: { $gte: start, $lte: end } }).select("name total dealer_id").sort('-_id')
        const ebills = await EBill.find({ date: { $gte: start, $lte: end } }).select("name total emp_id").sort('-_id')

        let loans = await Loan.find({ change: { $gt: 0 }, date_added: { $gte: start, $lte: end } }).select("name change").sort('-_id')

        let total_exps = expenses.map(v => v.amount).reduce((a, b) => a + b, 0) + products.map(v => v.price).reduce((a, b) => a + b, 0)

        let total_bills = bills.map(v => v.total).reduce((a, b) => a + b, 0) + ebills.map(v => v.total).reduce((a, b) => a + b, 0)

        let total_loans = loans.map(v => v.change).reduce((a, b) => a + b, 0)

        let total_add = addition.map(v => v.amount).reduce((a, b) => a + b, 0)

        let totals = {
            paid: invoices.map(elm => elm.paid ? elm.paid : 0).reduce((a, b) => a + b, 0),
            change: invoices.map(elm => elm.change ? elm.change : 0).reduce((a, b) => a + b, 0),
            price: invoices.map(elm => elm.total_price ? elm.total_price : 0).reduce((a, b) => a + b, 0),
        }

        res.status(201).render('safe/safe_view', {
            invoices,
            totals,
            expenses,
            addition,
            products,
            bills,
            ebills,
            total_exps,
            total_add,
            total_bills,
            total_loans,
            loans,
            start: start || '',
            end: end || ''
        })
    } catch (error) {
        return res.status(400).render("error")
    }


}