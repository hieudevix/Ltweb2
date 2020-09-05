const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../services/user');

passport.use(new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password'
},
    function (username, password, done) {
        User.findOne({
            where: {
                username
            }
        }).then(function (user) {
            if (!user || !User.verifyPassword(password, user.password)) {
                return false;
            };
            return user;
        }).asCallback(done);
    }
));

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    User.findByPk(id).asCallback(done);
});

module.exports = passport;