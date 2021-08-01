const jwt = require('jsonwebtoken')
const User = require('../models/User')


module.exports.isLogged = (req, res, next) => {


    const token = req.cookies._ms_in

    if (!token) return res.redirect('/login')

    jwt.verify(token, process.env.TOKEN_SECRET, (err, decoded_token) => {

        if (!err) return next()

        return res.redirect('/login')

    })
}

module.exports.isActive = (req, res, next) => {

    const token = req.cookies._ms_in

    if (!token) return res.redirect('/login')

    jwt.verify(token, process.env.TOKEN_SECRET, async(err, user) => {
        if (!err) {
            try {
                const { isActive } = await User.findById(user.id).select('isActive')
                if (!isActive) return res.render('not-active')
                else return next()
            } catch (error) {
                return res.render('error')
            }
        }
        return res.redirect('/login')
    })
}

module.exports.isEditor = (req, res, next) => {

    const token = req.cookies._ms_in

    if (!token) return res.redirect('/login')

    jwt.verify(token, process.env.TOKEN_SECRET, async(err, user) => {

        if (!err) {
            try {
                const { isEditor } = await User.findById(user.id).select('isEditor')
                if (!isEditor) return res.redirect("/")
                else next()
            } catch (error) {
                return res.render('error')
            }
        }
        return res.redirect('/')

    })
}
module.exports.isAdmin = (req, res, next) => {


    const token = req.cookies._ms_in

    if (!token) return res.redirect('/login')

    jwt.verify(token, process.env.TOKEN_SECRET, async(err, user) => {
        if (!err) {
            try {
                const { isAdmin } = await User.findById(user.id).select('isAdmin')
                if (!isAdmin) return res.status(403).redirect("/forbidden")
                return next()
            } catch (error) {
                return res.render('error')
            }
        }
        return res.redirect('/')

    })
}

module.exports.isBoth = (req, res, next) => {

    const token = req.cookies._ms_in

    if (!token) return res.redirect('/login')

    jwt.verify(token, process.env.TOKEN_SECRET, async(err, user) => {
        if (!err) {
            try {
                const { isAdmin, isEditor } = await User.findById(user.id).select('isAdmin isEditor')
                if (isAdmin || isEditor) {
                    req.user_type = {
                        admin: isAdmin,
                        editor: isEditor
                    }
                    return next()
                } else if (isAdmin === false && isEditor === false) {
                    return res.status(201).redirect("/user")
                } else return res.redirect("/")
            } catch (error) {

                return res.render('error')
            }
        }
        return res.redirect('/')
    })
}

module.exports.isSales = (req, res, next) => {

    const token = req.cookies._ms_in

    if (!token) return res.redirect('/login')

    jwt.verify(token, process.env.TOKEN_SECRET, async(err, user) => {
        if (!err) {
            try {
                const { isAdmin, isEditor, ref } = await User.findById(user.id).select('isAdmin isEditor ref')
                if (isAdmin || isEditor || ref === 'd') return next()
                else return res.redirect("/user")
            } catch (error) {
                return res.render('error')
            }
        }
        return res.redirect('/')
    })
}

module.exports.isNewUser = (req, res, next) => {

    const token = req.cookies._ms_in

    if (!token) return res.redirect('/login')

    jwt.verify(token, process.env.TOKEN_SECRET, async(err, user) => {
        if (!err) {
            try {
                const { isNewUser } = await User.findById(user.id).select('isNewUser')
                if (isNewUser) {
                    res.redirect("/user/new")
                } else next()
            } catch (error) {
                res.render("error")
            }
        } else {
            res.redirect('/user')
        }

    })
}





module.exports.logged_user = (req, res, next) => {

    const token = req.cookies._ms_in

    if (!token) {
        res.locals.user = null
        next()
    } else {
        jwt.verify(token, process.env.TOKEN_SECRET, async(err, decoded_token) => {
            if (!err) {
                let user = await User.findById(decoded_token.id).select('isAdmin isActive isEditor isNewUser name')
                req.c_id = user._id
                res.locals.user = user
                next()
            } else {
                res.locals.user = null
                next()
            }
        })
    }

}

module.exports.isNotAuth = (req, res, next) => {
    const token = req.cookies._ms_in
    if (token) res.redirect('/')
    else return next()
}


module.exports.isNotNewUser = (req, res, next) => {

    const token = req.cookies._ms_in

    if (!token) return res.redirect('/login')

    jwt.verify(token, process.env.TOKEN_SECRET, async(err, user) => {
        if (!err) {
            try {
                const { isNewUser } = await User.findById(user.id).select('isNewUser')
                if (!isNewUser) return res.redirect("/user")
                else next()
            } catch (error) {
                res.render("error")
            }
        } else {
            res.redirect('/user')
        }

    })



}