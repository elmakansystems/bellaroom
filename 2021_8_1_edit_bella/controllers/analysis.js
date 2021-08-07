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
        let year_start = new Date(d.getFullYear(), 0,1 )
        let year_end = new Date(d.getFullYear() + 1, 0,1 )

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


        function data_in_year_NR(model , attribute) {
            let data = [];
            model.forEach((elem, i) => {
          if (data.length == 0 && elem.date_added >= year_start && elem.date_added <= year_end) {
              data.push(elem[attribute]);
            } else {
                if (!data.includes(elem[attribute]) && elem.date_added >= start && elem.date_added <= end) {
              data.push(elem[attribute]);
            }
          }
        });
            return data
        }


        function data_in_date_year(model , attribute) {
            let data = [];
            let re = []
            model.forEach((elem, i) => {
          if (elem.date_added >= year_start && elem.date_added <= year_end) {
              data.push(elem[attribute]);
             
            } 
        });
        let x = data_in_year_NR(model , attribute)
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
            let sum = 0
            let bigNum = 0
            let id 
            model.forEach((elem, i) => {
                if (elem.date_added >= start && elem.date_added <= end) {
                    sum = sum + elem[data]
                    if(bigNum < elem[data] && elem[data] != null ){
                        bigNum = elem[data]
                        id = elem._id
                    }
                  } 
                });
                
                return {sum , bigNum , id}
            }
            
            //  تستخدم لاستخراج جمع البيانات من الموديل في تاريخ غير محدد 
        function totalSum(model , data) {
            let sum = 0
            let bigNum =0
            let id 
            model.forEach((elem, i) => {
                sum = sum + elem[data]
                if(bigNum < elem[data] && elem[data] != null ){
                    bigNum = elem[data]
                    id = elem._id
                }
            });
            
            return {sum , bigNum , id}
        }

        
        const invoices = await invoice.find().select('change date_added inv_products')
        const month_invoices = await invoice.find({ date_added: { $gte: start, $lte: end } }).select('total_price paid dealer date_added name')
        
        // العملاء المميزين خلال الشهر و عدد الفواتير الخاصة بهم خلال الشهر
       let client_of_period = data_in_date(month_invoices , "name").result[0][1]
       let client_of_period_num = data_in_date(month_invoices , "name").result[0][0]
       //    اعلى قمية عقد
       let invoice_of_period_num = totalSum_in_data(month_invoices , "total_price").bigNum
       
       //    البائع الاكثر تميزا خلال الفترة المحددة و عدد العقود المشتراه
       let dealer_of_period = data_in_date(month_invoices , "dealer").result[0][1]
       let dealer_of_period_num = data_in_date(month_invoices , "dealer").result[0][0]
       const dealer_name = await Dealer.find({_id : dealer_of_period}).select("name")
       
       //    الباقي خلال الفترة المحددة و خلال وجود السيستم 
       let change_of_period_sb = totalSum_in_data(invoices , 'change')
       let change_of_all_sb = totalSum(invoices , "change")
       //    اجمالي مستحقات العقود خلال فترة معينة 
       let price_of_period_sb = totalSum(month_invoices , "total_price")
       // اجمالي المدفوع خلال فترة معينة
       let paid_of_period_sb = totalSum(month_invoices , "paid")
       
       
       const sold_products = await InvProduct.find({ date_added: { $gte: start, $lte: end }}).select('inv_total product_id date_added')
       
       
       
    
       // محتاج يتعدل التاريخ او نشوف طريقة حل لمشكلة التاريخ دي يا باشا 
        const order = await Order.find({ dateAdded: { $gte: start , $lte: end } })
        
         
        const products = await Product.find()
        let products_filterd = products.filter( v =>  v.p_type =="collection")
        let parts_filterd = products.filter( v =>  v.p_type =="part")
        let old_products = products.filter( v =>  v.p_type ==null)

        // مجموع اسعار المنتجات خلال فترة معينة  و غير معينة 
        let products_of_period_sb = totalSum_in_data(products_filterd , 'price')
        let products_of_all_sb = totalSum(products_filterd , 'price')
        let parts_of_period_sb = totalSum_in_data(parts_filterd , 'price')
        let parts_of_all_sb = totalSum(parts_filterd , 'price')
        
        
        
        let products_period_filterd = products.filter( v =>  v._id ==products_of_period_sb.id)
        let products_all_filterd = products.filter( v =>  v._id ==products_of_period_sb.id)

        let parts_period_filterd = products.filter( v =>  v._id ==parts_of_period_sb.id)
        let parts_all_filterd = products.filter( v =>  v._id ==parts_of_period_sb.id)
        

        const most_parts_all = await Product.find({_id : parts_of_all_sb.id})
        const most_parts_period = await Product.find({_id : parts_of_period_sb.id})
        if(most_parts_period.length > 0){
            var most_parts_period_name = most_parts_period[0].name
        }else{
            var most_parts_period_name = 'no parts'
        }
        if(most_parts_all.length > 0){
            var most_parts_all_name = most_parts_all[0].name
        }else{
            var most_parts_all_name = 'no parts'
        }

        const most_products_all = await Product.find({_id : products_of_all_sb.id})
        const most_products_period = await Product.find({_id : products_of_period_sb.id})
        if(most_products_period.length > 0){
            var most_products_period_name = most_products_period[0].name
        }else{
            var most_products_period_name = 'no products'
        }
        if(most_products_all.length > 0){
            var most_products_all_name = most_products_all[0].name
        }else{
            var most_products_all_name = 'no products'
        }
        
        





        //   منتجات تم شراؤها حديثا عددها و اسمها
        let products_of_month_n = data_in_date(products_filterd , "name").data.length
        let products_of_month = data_in_date(products_filterd , "name").data
        
        
      
        //   قطع تم شراؤها حديثا عددها و اسمها
        let parts_of_month_n = data_in_date(parts_filterd , "name").data.length
        let parts_of_month = data_in_date(parts_filterd , "name").data
        


        // المصاريف و الاضافات
        const expenses = await Expenses.find().select('amount text date_added').sort('-_id')
        let expenses_of_period_sb = totalSum_in_data(expenses , 'amount')
        let expenses_of_all_sb = totalSum(expenses , 'amount')
        const most_expenses_all = await Expenses.find({_id : expenses_of_all_sb.id})
        const most_expenses_period = await Expenses.find({_id : expenses_of_period_sb.id})
        if(most_expenses_period.length > 0){
            var most_expenses_period_name = most_expenses_period[0].text
        }else{
            var most_expenses_period_name = 'no expenses'
        }
        if(most_expenses_all.length > 0){
            var most_expenses_all_name = most_expenses_all[0].text
        }else{
            var most_expenses_all_name = 'no expenses'
        }
        

        
        
        const addition = await Addition.find().select('amount text date_added').sort('-_id')
        let addition_of_period_sb = totalSum_in_data(addition , 'amount')
        let addition_of_all_sb = totalSum(addition , 'amount')
        const most_addition_all = await Addition.find({_id : addition_of_all_sb.id})
        const most_addition_period = await Addition.find({_id : addition_of_period_sb.id})
        if(most_addition_period.length > 0){
           var most_addition_period_name = most_addition_period[0].text
        }else{
            var most_addition_period_name = 'no addition' 
        }
        if(most_addition_all.length > 0){
           var most_addition_all_name = most_addition_all[0].text
        }else{
            var most_addition_all_name = 'no addition'
        }



        // فلوس الموظفين
        
        const bills = await Bill.find().select("name total dealer_id date")
       
        let bills_of_period_sb = totalSum_in_data(bills , 'total')
        
        let bills_of_all_sb = totalSum(bills , 'total')
        const most_bills_all = await Bill.find({_id : bills_of_all_sb.id})
        const most_bills_period = await Bill.find({_id : bills_of_period_sb.id})
        if(most_bills_period.length > 0){
            var most_bills_period_name = most_bills_period[0].name
        }else{
            var most_bills_period_name = 'no bills' 
        }
        if(most_bills_all.length > 0){
            var most_bills_all_name = most_bills_all[0].name
        }else{
            var most_bills_all_name = 'no bills'
        }
        
        
        const ebills = await EBill.find().select("name total emp_id date").sort('-_id')

        let ebills_of_period_sb = totalSum_in_data(ebills , 'total')
        let ebills_of_all_sb = totalSum(ebills , 'total')
        const most_ebills_all = await EBill.find({_id : ebills_of_all_sb.id})
        const most_ebills_period = await EBill.find({_id : ebills_of_period_sb.id})
        if(most_ebills_period.length > 0){
            var most_ebills_period_name = most_ebills_period[0].name
        }else{
            var most_ebills_period_name = 'no bills' 
        }
        if(most_ebills_all.length > 0){
            var most_ebills_all_name = most_ebills_all[0].name
        }else{
            var most_ebills_all_name = 'no bills'
        }

        // السلف
        let loans = await Loan.find({ change: { $gt: 0 } }).select("name change date_added").sort('-_id')
        let loans_of_period_sb = totalSum_in_data(loans , 'change')
        let loans_of_all_sb = totalSum(loans , 'change')
        const most_loans_all = await  Loan.find({_id : loans_of_all_sb.id})
        const most_loans_period = await  Loan.find({_id : loans_of_period_sb.id})
        if(most_loans_period.length > 0){
            var most_loans_period_name = most_loans_period[0].name
        }else{
            var most_loans_period_name = 'no Loan' 
        }
        if(most_loans_all.length > 0){
            var most_loans_all_name = most_loans_all[0].name
        }else{
            var most_loans_all_name = 'no Loan'
        }


        
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


        let analysis = {
            client_of_period , 
            client_of_period_num,
            invoice_of_period_num,
            dealer_name,
            dealer_of_period_num,
            change_of_period_sb,
            change_of_all_sb,
            price_of_period_sb,
            paid_of_period_sb,
            parts_of_period_sb,
            parts_of_all_sb,
            products_period_filterd,
            products_all_filterd,
            parts_period_filterd,
            parts_all_filterd,
            products_of_period_sb,
            products_of_all_sb,
            parts_of_period_sb,
            parts_of_all_sb,
            most_products_period_name , 
            most_products_all_name,
            most_parts_period_name,
            most_parts_all_name,
            products_of_month,
            products_of_month_n,
            parts_of_month_n,
            parts_of_month,
            expenses_of_period_sb,
            expenses_of_all_sb,
            most_expenses_period_name,
            most_expenses_all_name,
            addition_of_period_sb,
            addition_of_all_sb,
            most_addition_period_name,
            most_addition_all_name,
            bills_of_period_sb,
            bills_of_all_sb,
            most_bills_period_name,
            most_bills_all_name,
            ebills_of_period_sb,
            ebills_of_all_sb,
            most_ebills_period_name,
            most_ebills_all_name,
            loans_of_period_sb,
            loans_of_all_sb,
            most_loans_period_name,
            most_loans_all_name,

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
            analysis,
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