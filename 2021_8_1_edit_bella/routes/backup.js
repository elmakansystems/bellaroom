const router = require('express').Router()
const models = require("../models/models")
const fs = require('fs')
const makeDir = require('make-dir');
const mongoose = require('mongoose');
const Attend = require('../models/Attend');
const fetch = require('../helpers/fetch');


router.get('/', (req, res) => res.render('backup'))
router.get('/download', (req, res) => {
    const models = [{
            model: 'Addition',
            name: 'الاضافات'
        },
        {
            model: 'Attend',
            name: 'الغياب'
        },
        {
            model: 'Bill',
            name: 'مرتبات  السيلز'
        },
        {
            model: 'Day',
            name: 'ايام الحضور'
        },
        {
            model: 'Dealer',
            name: 'السيلز'
        },
        {
            model: 'EBill',
            name: 'مرتبات العمال'
        },
        {
            model: 'Employee',
            name: 'العمال'
        },
        {
            model: 'Expenses',
            name: 'المصروفات'
        },
        {
            model: 'Invoice',
            name: 'فواتير البيع'
        },
        {
            model: 'InvProduct',
            name: 'منتجات الفاتورة'
        },
        {
            model: 'Loan',
            name: 'السلف'
        },
        {
            model: 'Material',
            name: 'الخامات'
        },
        {
            model: 'Order',
            name: 'اوامر الشغل'
        },
        {
            model: 'Product',
            name: 'المنتجات'
        },
        {
            model: 'User',
            name: 'المستخدمين'
        }

    ]
    return res.render('backup/download', { models })
})
router.get('/list', (req, res) => res.render('backup/list'))

router.post('/download', async(req, res) => {

    const { model } = req.body

    try {
        let db_name = new Date().toLocaleDateString().split('/').join('-')
        let options = { useNewUrlParser: true, useUnifiedTopology: true }
        let str = 'mongodb://localhost/bella-' + db_name
        const backup = await mongoose.createConnection(str, options);
        console.log('='.repeat(50))
        console.log('connected to local db...'.yellow);
        console.log('='.repeat(50))
        await backup.model(model).deleteMany()
        console.log('='.repeat(50))
        console.log('local models deleted'.red);
        console.log('='.repeat(50))
        const data = await models[model].find()

        await backup.model(model).insertMany(data, function(err) {
            if (!err) {
                console.log('='.repeat(50))
                console.log('added new documents'.green);
                console.log('='.repeat(50))
                return res.status(200).send({ success: 'done' })
            } else res.status(400).json({ err: 'لم يتم الحفظ' })
        })

    } catch (error) {
        return res.status(400).json({ err: error.message }).render('error')
    }




    // const data = JSON.stringify(result, null, 2)

    // const pathName = await makeDir(`backup/${model}`)

    // fs.writeFile(`${pathName}/${model}-${new Date().toLocaleDateString().split('/').join('-')}-${new Date().toLocaleTimeString().split(':').join('-').split(' ')[0]}.json`, data, err => {
    //     if (err) {
    //         console.error(err)
    //         return
    //     }
    //     res.send('done')
    //         //file written successfully
    // })








})






module.exports = router