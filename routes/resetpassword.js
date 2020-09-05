const { Router } = require('express');
const asyncHandler = require('express-async-handler');
const Email = require('../services/email');
const User = require('../services/user');

const router = new Router();

router.get('/', function getLogin(req, res) {
    if (req.currentUser) {
        return res.redirect('/salaib');
    }

    return res.redirect(`/resetpassword/Request?alert=`);
});

router.get('/Request', function getLogin(req, res) {
    if (req.currentUser) {
        return res.redirect('/salaib');
    }

    const { alert } = req.query;

    res.render('resetpassword', { alert, page_name: 'resetpassword' });
});

router.post('/Request', asyncHandler(async function (req, res) {
    const found = await User.findByEmail(req.body.email);
    if (!found) {
        return res.redirect(`/resetpassword/Request?alert=0`);
    }
    found.addToken();
    await Email.send(found.email, 'Quên mật khẩu - SalaBank <no-reply>', `<b>Quý khách vui lòng không chia sẻ link cho bất kỳ ai để tránh mất tài khoản!</b><br>Click vào đường dẫn để đặt lại mật khẩu: ${process.env.BASE_URL}/resetpassword/userId/${found.id}/${found.token}`);

    return res.redirect(`/resetpassword/Request?alert=1`);
}));

router.get('/userId/:id/:token', asyncHandler(async (req, res) => {
    const { id, token } = req.params;
    const { alert } = req.query;

    const user = await User.findById(id);
    if (user && user.token == token) {
        return res.render('update_password', { user, alert, page_name: 'update_password' });
    }
    return res.redirect(`/resetpassword/Request?alert=2`);
}));

router.post('/userId/:id/:token', asyncHandler(async (req, res) => {
    const { id, token } = req.params;

    const user = await User.findById(id);
    if (user && user.token == token) {
        if (req.body.password == req.body.password_again) {
            const user = await User.findById(id);
            const hashedPassword = await User.hashPassword(req.body.password);
            await user.updatePassword(hashedPassword);
            await user.tokenNull();

            return res.redirect(`/resetpassword/Request?alert=3`);
        }
    }
    await user.tokenNull();
    return res.redirect(`/resetpassword/Request?alert=4`);
}));

module.exports = router;