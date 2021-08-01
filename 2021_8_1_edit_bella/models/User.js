const mongoose = require('mongoose')
const { isEmail } = require("validator")
const bcrypt = require('bcrypt')
const user_schema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'من فضلك ادخل اسم المستخدم ']
    },
    email: {
        type: String,
        required: [true, 'من فضلك ادخل بريد الكتروني'],
        lowercase: true,
        unique: true,
        validate: [isEmail, 'من فضلك ادخل بريد الكتروني صحيح ']
    },
    password: {
        type: String,
        required: [true, 'من فضلك ادخل كلمة مرور'],
        minlength: [6, 'كلمة المرور اقل من 6 احرف']
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: false
    },
    isEditor: {
        type: Boolean,
        default: false
    },
    isNewUser: {
        type: Boolean,
        default: true
    },
    id: {
        type: mongoose.Schema.Types.ObjectId,
    },
    ref: {
        type: String,
        default: ''
    }
})

user_schema.pre('save', async function(next) {
    const salt = await bcrypt.genSalt()
    this.password = await bcrypt.hash(this.password, salt)
    next()
})


user_schema.statics.login = async function(email, password) {
    const user = await this.findOne({ email })
    if (!user) throw Error('يوجد خطأ في البريد الالكتروني او كلمة المرور ')
    else {
        const auth = await bcrypt.compare(password, user.password)
        if (!auth) throw Error('يوجد خطأ في البريد الالكتروني او كلمة المرور ')
        return user
    }
}

module.exports = mongoose.model('User', user_schema)