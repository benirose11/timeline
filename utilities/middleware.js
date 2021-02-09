module.exports.isLoggedIn = (req, res, next) =>{
    if(!req.isAuthenticated()){
    req.session.returnto = req.originalUrl
    req.flash('error', 'You must be signed in to do that')
    return res.redirect('/login')
} else { next();}
}