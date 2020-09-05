const { Router } = require('express');
const passport = require('../middlewares/passport');
const Recaptcha = require('express-recaptcha').RecaptchaV3;

const recaptcha = new Recaptcha('6LdyAbYZAAAAAD5K2A2gi9rZXfuhRdWsRX1HFatZ', '6LdyAbYZAAAAALyv0zCvcN5rJSmUzG8vD0I5-JO2', { callback: 'cb' });

const router = new Router();

router.get('/', recaptcha.middleware.render, function getLogin(req, res) {
    if (req.currentUser) {
        return res.redirect('/salaib');
    }
    res.render('login', { captcha: res.recaptcha, error: null, page_name: 'login' });
});

router.post('/', recaptcha.middleware.verify, function (req, res, next) {
    if (!req.recaptcha.error) {
        passport.authenticate('local', function (err, user, info) {
            if (err) { return next(err); }
            if (!user) {
                return res.render('login', { error: 'Username hoặc Password.', page_name: 'login' });
            }
            req.logIn(user, function (err) {
                if (err) { return next(err); }
                if (user.status == '0') {
                    req.logout();
                    return res.render('login', { error: 'Tài khoản quý khách chưa được kích hoạt.', page_name: 'login' });
                }
                if (user.status == '2') {
                    req.logout();
                    return res.render('login', { error: 'Tài khoản quý khách đang bị khóa.', page_name: 'login' });
                }
                if (user.status == '-1') {
                    req.logout();
                    return res.render('login', { error: 'Tài khoản quý khách bị từ chối.', page_name: 'login' });
                }
                if (user.isStaff) {
                    return res.redirect('/admincp');
                }
                return res.redirect('/salaib');
            });
        })(req, res, next);
    } else {
        return res.render('login', { error: 'reCAPTCHA.', page_name: 'login' });
    }
});

module.exports = router;