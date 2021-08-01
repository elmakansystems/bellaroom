const router = require('express').Router()

// const { get_all_receipts, get_single_receipt } = require('../controllers/receipt')

router.get('/', (req, res) => res.render('receipt'))



// router.get('/', get_all_receipts)

// router.get('/:id', get_single_receipt)

module.exports = router