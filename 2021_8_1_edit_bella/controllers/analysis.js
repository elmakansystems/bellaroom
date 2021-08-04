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



        // تستخدم لاستخراج البيانات من الموديل في 
        // Array
        // و ممكن تستخدم في عددهم 

        // و هنا البيانات غير مكررة 


        function data_in_date_NR(model , attribute) {
            let data = [];
            model.forEach((elem, i) => {
          if (data.length == 0 && elem.date_added >= start && elem.date_added <= end) {
              data.push(elem[attribute]);
            } else {
                if (!data.includes(elem[attribute]) && elem.date_added >= start && elem.date_added <= end) {
              data.push(elem[attribute]);
            }
          }
        });
            return data
        }
      

        
        // تستخدم لاستخراج البيانات من الموديل في 
        // Array
        // و ممكن تستخدم في عددهم 


        function data_in_date(model , attribute) {
            let data = [];
            let re = []
            model.forEach((elem, i) => {
          if (elem.date_added >= start && elem.date_added <= end) {
              data.push(elem[attribute]);
            } 
        });
        let x = data_in_date_NR(model , attribute)
        x.forEach(elem => {
            if(elem != null){
                re.push([data.filter(v => v===elem).length , elem]) 
            }
        });
        result = re.sort().reverse()
        
        
       
            return  {result , data}
        }

        //  تستخدم لاستخراج جمع البيانات من الموديل في تاريخ محدد 
        
        
        function totalSum_in_data(model , data) {
            let result = 0
            let bigNum = 0
            model.forEach((elem, i) => {
                if (elem.date_added >= start && elem.date_added <= end) {
                    result = result + elem[data]
                    if(bigNum < elem[data] && elem[data] != null ){
                        bigNum = elem[data]
                    }
                  } 
                });
                
                return {result , bigNum}
            }
            
            //  تستخدم لاستخراج جمع البيانات من الموديل في تاريخ غير محدد 
        function totalSum(model , data) {
            let result = 0
            let bigNum =0

            model.forEach((elem, i) => {
                result = result + elem[data]
                if(bigNum < elem[data] && elem[data] != null ){

                    bigNum = elem[data]
                }
            });
            
          
            return {result , bigNum}
        }

        




        const invoices = await invoice.find().select('change date_added')
        const month_invoices = await invoice.find({ date_added: { $gte: start, $lte: end } }).select('total_price paid dealer date_added name')
        
      

        // العملاء المميزين خلال الشهر و عدد الفواتير الخاصة بهم خلال الشهر
       let client_of_period = data_in_date(month_invoices , "name").result[0][1]
       let client_of_period_num = data_in_date(month_invoices , "name").result[0][0]

    //    اعلى قمية عقد
       let invoice_of_period_num = totalSum_in_data(month_invoices , "total_price").bigNum

       
       //    البائع الاكثر تميزا خلال الفترة المحددة و عدد العقود المشتراه
       let dealer_of_period = data_in_date(month_invoices , "dealer").result[0][1]
       let dealer_of_period_num = data_in_date(month_invoices , "dealer").result[0][0]
       const dealer_name = await Dealer.find({_id : dealer_of_period})
      
    //    الباقي خلال الفترة المحددة و خلال وجود السيستم 
       let change_of_period = totalSum_in_data(invoices , 'change')
       let change_of_all = totalSum(invoices , "change")

    //    اجمالي مستحقات العقود خلال فترة معينة 
       let price_of_period = totalSum(month_invoices , "total_price")
    //    اجمالي المدفوع خلال فترة معينة
       let paid_of_period = totalSum(month_invoices , "paid")
      
        
        
      
       


        

       const sold_products = await InvProduct.find({ date_added: { $gte: start, $lte: end }}).select('inv_total product_id date_added')


       
    
     

       



     
        // محتاج يتعدل التاريخ او نشوف طريقة حل لمشكلة التاريخ دي يا باشا 
        const order = await Order.find({ dateAdded: { $gte: start , $lte: end } })
         
       
        const total_paid = sold_products.map(v => v.inv_total).reduce((a, b) => a + b, 0) || 0
        
        
        const products = await Product.find().select('p_type price name dealer date_added')
        let products_filterd = products.filter( v =>  v.p_type =="collection")
        let parts_filterd = products.filter( v =>  v.p_type =="part")
        
        // منتحات الشهر الحالي
        let products_of_month_n = data_in_date(products_filterd , "name").data.length
        let products_of_month = data_in_date(products_filterd , "name").data
        // قطع الشهر الحالي
        let parts_of_month_n = data_in_date(parts_filterd , "name").data.length
        let parts_of_month = data_in_date(parts_filterd , "name").data
        


        
        

        // المصاريف و الاضافات
        
        const expenses = await Expenses.find({ date_added: { $gte: start, $lte: end } }).select('amount text date_added').sort('-_id')
        const addition = await Addition.find({ date_added: { $gte: start, $lte: end } }).select('amount text date_added').sort('-_id')
      
        // فلوس الموظفين
        const bills = await Bill.find({ date: { $gte: start, $lte: end } }).select("name total dealer_id date").sort('-_id')
        const ebills = await EBill.find({ date: { $gte: start, $lte: end } }).select("name total emp_id date").sort('-_id')

        let loans = await Loan.find({ change: { $gt: 0 } }).select("name change date_added").sort('-_id')

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