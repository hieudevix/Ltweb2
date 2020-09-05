const moment = require('moment');

module.exports = function auth(req, res, next) {
    req.currentUser = req.user;
    res.locals.currentUser = req.user;
    res.locals.moment = moment;
    next();
};