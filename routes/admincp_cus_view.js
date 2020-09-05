const { Router } = require('express');
const asyncHandler = require('express-async-handler');
const random = require('random');
const moment = require('moment');
const upload = require('../middlewares/upload');
const User = require('../services/user');
const Account = require('../services/account');
const Transaction = require('../services/transaction');
const Email = require('../services/email');

const router = new Router();

router.get('/Request', asyncHandler(async (req, res) => {
    if (!req.currentUser || (req.currentUser && !req.currentUser.isStaff)) {
        return res.redirect('/');
    }

    const { username, alert, acc_number, amount } = req.query;
    const countPendingAuthCus = await User.count({ where: { status: 0 } });

    if (!username) { return res.redirect('/'); };
    const user = await User.findOne({ where: { username }, include: [Account], order: [['id', 'ASC']] });
    if (user) {
        return res.render('admincp/cus_view', { staff: req.currentUser, user, countPendingAuthCus, alert, acc_number, amount, page_name: 'cus_view' });
    }
    res.redirect('/');
}));

const cpUpload = upload.fields([{ name: 'avatar', maxCount: 1 }, { name: 'imgId', maxCount: 1 }])
router.post('/Request', cpUpload, function (req, res, next) {
    next();
});

router.post('/Request', asyncHandler(async (req, res) => {
    if (!req.currentUser || (req.currentUser && !req.currentUser.isStaff)) {
        return res.redirect('/');
    }

    const user = await User.findOne({ where: { username: req.body.username }, include: [Account] });

    // Cash Deposit
    if (req.body.btnCash) {
        let _sotien = req.body.sotien;
        _sotien = _sotien.replace(/,/g, '');
        _sotien = _sotien.replace(/\./g, '');

        let trans_code;
        do {
            trans_code = random.int(min = 111111111, max = 999999999).toString();
            _trans = await Transaction.findOne({ where: { trans_code } });
        } while (_trans);
        const acc = await Account.findOne({ where: { account_number: req.body.account_number } });
        const currBalanceCredit = Number(acc.current_balance) + Number(_sotien);
        const avaiBalanceCredit = Number(acc.available_balance) + Number(_sotien);
        const promise1 = Transaction.add(trans_code + 'c', 'Trong hệ thống SLB', acc.account_number, acc.account_number, user.displayName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, 'd').replace(/Đ/g, 'D').toUpperCase(), null, _sotien, 0, '#' + user.displayName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, 'd').replace(/Đ/g, 'D').toUpperCase() + ' NOP TIEN MAT', currBalanceCredit, 'GD đã hoàn tất', true, null, true, acc.id);
        const promise2 = acc.updateBalance(currBalanceCredit, avaiBalanceCredit);
        const promise3 = Email.send(user.email, 'mailalert - SalaBank <no-reply>', `SalaBank - Kính gửi Quý khách hàng.<br>SLB trân trọng thông báo tài khoản <b>${acc.account_number}</b> của Quý khách đã thay đổi số dư như sau:<br>Số dư mới của tài khoản trên là: <b>${new Intl.NumberFormat('vi').format(acc.current_balance)} ${acc.currency}</b> tính đến <b>${moment().format('DD/MM/yyyy')}</b>.<br>Giao dịch mới nhất: Ghi có <b>+${new Intl.NumberFormat('vi').format(_sotien)} ${acc.currency}</b>.<br>Nội dung giao dịch: <b>#${user.displayName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, 'd').replace(/Đ/g, 'D').toUpperCase()} NOP TIEN MAT</b>.<br><br>Cảm ơn Quý khách hàng đã sử dụng Sản phẩm/ Dịch vụ của SLB.<br>Chúng tôi mong được tiếp tục phục vụ Quý khách hàng.<br>Trân trọng.<br><br><br><center>-------------------------------------------------------------------------------------------------</center><br><center>Đây là dịch vụ Email tự động của SLB, Quý khách vui lòng không "Reply".</center><br><center>-------------------------------------------------------------------------------------------------</center>`);

        await Promise.all([promise3, promise1, promise2]);

        return res.redirect(`/admincp/customers/view/Request?username=${user.username}&acc_number=${req.body.account_number}&amount=${_sotien}&alert=1`);
    }

    if (user) {
        if (!req.files['avatar'] && !req.files['imgId']) {
            await user.saveProfileNoFile(req.body.email, req.body.displayName, req.body.identification, req.body.numberId, req.body.dateRange.split('-').reverse().join('-'));
            return res.redirect(`/admincp/customers/view/Request?username=${user.username}`);
        }
        if (!req.files['avatar'] && req.files['imgId']) {
            await user.saveProfile(user.avatar, req.files['imgId'][0].buffer.toString('base64'), req.body.email, req.body.displayName, req.body.identification, req.body.numberId, req.body.dateRange.split('-').reverse().join('-'));
            return res.redirect(`/admincp/customers/view/Request?username=${user.username}`);
        }
        if (req.files['avatar'] && !req.files['imgId']) {
            await user.saveProfile(req.files['avatar'][0].buffer.toString('base64'), user.imgId, req.body.email, req.body.displayName, req.body.identification, req.body.numberId, req.body.dateRange.split('-').reverse().join('-'));
            return res.redirect(`/admincp/customers/view/Request?username=${user.username}`);
        }

        await user.saveProfile(req.files['avatar'][0].buffer.toString('base64'), req.files['imgId'][0].buffer.toString('base64'), req.body.email, req.body.displayName, req.body.identification, req.body.numberId, req.body.dateRange.split('-').reverse().join('-'));
        return res.redirect(`/admincp/customers/view/Request?username=${user.username}`);
    }
    res.redirect('/');
}));

router.get('/auth/:id/:action', asyncHandler(async (req, res) => {
    if (!req.currentUser || (req.currentUser && !req.currentUser.isStaff)) {
        return res.redirect('/');
    }

    const { id, action } = req.params;
    const user = await User.findById(id);
    if (user) {
        if (action == '11') {
            await user.authUser(1);
            return res.redirect(`/admincp/customers/view/Request?username=${user.username}`);
        }

        await user.authUser(action);
        if (action != '1') {
            return res.redirect(`/admincp/customers/view/Request?username=${user.username}`);
        }

        let account_number;
        do {
            account_number = random.int(min = 11111111, max = 99999999).toString();
            account_number = '2' + account_number;
            _acc = await Account.findOne({ where: { account_number } });
        } while (_acc);
        await Account.add(account_number, req.currentUser.locate, 0, 0, 'VND', null, new Date(), null, 0, 0, 'TGTT KHTN (CA NHAN)', false, id);

        // Fee open a new Account: 100.000 VND
        let trans_code;
        do {
            trans_code = random.int(min = 111111111, max = 999999999).toString();
            _trans = await Transaction.findOne({ where: { trans_code } });
        } while (_trans);
        const acc = await Account.findOne({ where: { account_number } });
        const promise1 = Transaction.add(trans_code + 'c', 'Trong hệ thống SLB', acc.account_number, acc.account_number, user.displayName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, 'd').replace(/Đ/g, 'D').toUpperCase(), null, 100000, 0, '#NOP TM MO TAI KHOAN TGTT KHTN (CA NHAN)', 100000, 'GD đã hoàn tất', true, null, true, acc.id);
        const promise2 = acc.updateBalance(100000, 0);
        const promise3 = Email.send(user.email, 'mailalert - SalaBank <no-reply>', `SalaBank - Kính gửi Quý khách hàng.<br>Username: <b>${user.username}</b> đã được kích hoạt!<br>SLB trân trọng thông báo tài khoản <b>${acc.account_number}</b> của Quý khách đã thay đổi số dư như sau:<br>Số dư mới của tài khoản trên là: <b>${new Intl.NumberFormat('vi').format(acc.current_balance)} ${acc.currency}</b> tính đến <b>${moment().format('DD/MM/yyyy')}</b>.<br>Giao dịch mới nhất: Ghi có <b>+${new Intl.NumberFormat('vi').format(100000)} ${acc.currency}</b>.<br>Nội dung giao dịch: <b>#NOP TM MO TAI KHOAN TGTT KHTN (CA NHAN)</b>.<br><br>Cảm ơn Quý khách hàng đã sử dụng Sản phẩm/ Dịch vụ của SLB.<br>Chúng tôi mong được tiếp tục phục vụ Quý khách hàng.<br>Trân trọng.<br><br><br><center>-------------------------------------------------------------------------------------------------</center><br><center>Đây là dịch vụ Email tự động của SLB, Quý khách vui lòng không "Reply".</center><br><center>-------------------------------------------------------------------------------------------------</center>`);

        await Promise.all([promise3, promise1, promise2]);

        return res.redirect(`/admincp/customers/view/Request?username=${user.username}`);
    }
    res.redirect('/');
}));

module.exports = router;