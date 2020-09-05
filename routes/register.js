const { Router } = require('express');
const { body, validationResult } = require('express-validator');
const upload = require('../middlewares/upload');
const User = require('../services/user');
const Email = require('../services/email');
const asyncHandler = require('express-async-handler');

const router = new Router();

router.get('/', function (req, res) {
    if (req.currentUser) {
        return res.redirect('/');
    }
    res.render('register', { errors: null, success: null, page_name: 'register' });
});

router.post('/', upload.single('imgId'), function (req, res, next) {
    next();
})

router.post('/', [
    body('username')
        .notEmpty()
        .isLength({ min: 3 })
        .custom(async (username) => {
            const found = await User.findByUsername(username);
            if (found) {
                throw Error('Username exists!');
            }
            return true;
        }),
    body('email')
        .isEmail()
        //.normalizeEmail()
        .custom(async (email) => {
            const found = await User.findByEmail(email);
            if (found) {
                throw Error('Email exists!');
            }
            return true;
        }),
    body('displayName')
        .trim()
        .notEmpty(),
    body('password')
        .isLength({ min: 6 }),
    body('numberId')
        .notEmpty()
        .isLength({ min: 9 })
        .custom(async (numberId) => {
            const found = await User.findOne({ where: { numberId } });
            if (found) {
                throw Error('NumberId exists!');
            }
            return true;
        }),
], asyncHandler(async function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).render('register', { errors: errors.array(), page_name: 'register' });
    }
    await User.create({
        username: req.body.username,
        email: req.body.email,
        password: User.hashPassword(req.body.password),
        displayName: req.body.displayName,
        identification: req.body.identification,
        numberId: req.body.numberId,
        dateRange: req.body.dateRange,
        imgId: req.file.buffer.toString('base64'),
    })
    await Email.send(req.body.email, 'SalaBank - Registration', `Xin vui lòng chờ nhân viên ngân hàng kích hoạt tài khoản của quý khách!`);

    res.render('register', { errors: null, success: '1', page_name: 'register' });
}));

module.exports = router;