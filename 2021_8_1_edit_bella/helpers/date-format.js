module.exports.ar_date_splitted = () => {
    t = new Date()
    return {
        date: t.toLocaleDateString('ar-EG-u-nu-latn', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' }),
        month: t.toLocaleDateString('ar-EG-u-nu-latn', { month: 'short' }),
        year: t.toLocaleDateString('ar-EG-u-nu-latn', { year: 'numeric' }),
        time: t.toLocaleTimeString('ar-EG'),
    }


}