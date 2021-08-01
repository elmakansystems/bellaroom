const { isLogged, isActive, isAdmin } = require('../middlewares/auth')

const router = require('express').Router()


router.get('/', isLogged, isActive, isAdmin, require('../controllers/safe').current_month_data)

router.get('/get', isLogged, isActive, isAdmin, (req, res) => res.status(201).redirect('/safe'))

router.post('/get', isLogged, isActive, isAdmin, require('../controllers/safe').specific_data_range)


module.exports = router