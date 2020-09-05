const { Router } = require('express');
const asyncHandler = require('express-async-handler');
const User = require('../services/user');
const Account = require('../services/account');

const router = new Router();

router.get('/', asyncHandler(async (req, res) => {
    if (!req.currentUser || !(req.currentUser && req.currentUser.isStaff)) {
        return res.redirect('/');
    }

    const users = await User.findAll({ where: { isStaff: false }, include: [Account] });
    const countPendingAuthCus = await User.count({ where: { status: 0 } });

    res.render('admincp/cus_findAll', { staff: req.currentUser, users, countPendingAuthCus, page_name: 'cus_findAll' });
}));


router.get('/auth/:id/:action', asyncHandler(async (req, res) => {
    const { id, action } = req.params;
    const user = await User.findById(id);

    if (action == '11') {
        await user.authUser(1);
        return res.redirect('/admincp/customers/findAll');
    }

    if (user && action == '2') {
        await user.authUser(action);
        return res.redirect('/admincp/customers/findAll');
    }
    res.redirect('/');
}));

module.exports = router;