module.exports = function requireLoggedIn(req, res, next){
    if (!req.currentUser || req.currentUser.token) {
        res.redirect('/');
    } else {
        next();
    }
};