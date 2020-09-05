const { Router } = require('express');
const asyncHandler = require('express-async-handler');
const random = require('random');
const moment = require('moment');
const User = require('../services/user');
const Account = require('../services/account');
const Transaction = require('../services/transaction');
const Email = require('../services/email');

const router = new Router();

router.get('/', asyncHandler(async (req, res) => {
    if (!req.currentUser || !(req.currentUser && req.currentUser.isStaff)) {
        return res.redirect('/');
    }
    const users = await User.findAll({ where: { status: 0, isStaff: false } });
    const countPendingAuthCus = await User.count({ where: { status: 0 } });

    res.render('admincp/cus_pending_req', { staff: req.currentUser, users, countPendingAuthCus, page_name: 'cus_pending_req' });
}));

router.get('/auth/:id/:action', asyncHandler(async (req, res) => {
    const { id, action } = req.params;
    const user = await User.findById(id);
    if (user) {
        await user.authUser(action);
        if (action != '1') {
            return res.redirect('/admincp/customers/pendingRequests');
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
        await Transaction.add(trans_code + 'c', 'Trong hệ thống SLB', acc.account_number, acc.account_number, user.displayName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, 'd').replace(/Đ/g, 'D').toUpperCase(), null, 100000, 0, '#NOP TM MO TAI KHOAN TGTT KHTN (CA NHAN)', 100000, 'GD đã hoàn tất', true, null, true, acc.id);
        await acc.updateBalance(100000, 0);
        await Email.send(user.email, 'mailalert - SalaBank <no-reply>', `SalaBank - Kính gửi Quý khách hàng.<br>Username: <b>${user.username}</b> đã được kích hoạt!<br>SLB trân trọng thông báo tài khoản <b>${acc.account_number}</b> của Quý khách đã thay đổi số dư như sau:<br>Số dư mới của tài khoản trên là: <b>${new Intl.NumberFormat('vi').format(acc.current_balance)} ${acc.currency}</b> tính đến <b>${moment().format('DD/MM/yyyy')}</b>.<br>Giao dịch mới nhất: Ghi có <b>+${new Intl.NumberFormat('vi').format(100000)} ${acc.currency}</b>.<br>Nội dung giao dịch: <b>#NOP TM MO TAI KHOAN TGTT KHTN (CA NHAN)</b>.<br><br>Cảm ơn Quý khách hàng đã sử dụng Sản phẩm/ Dịch vụ của SLB.<br>Chúng tôi mong được tiếp tục phục vụ Quý khách hàng.<br>Trân trọng.<br><br><br><center>-------------------------------------------------------------------------------------------------</center><br><center>Đây là dịch vụ Email tự động của SLB, Quý khách vui lòng không "Reply".</center><br><center>-------------------------------------------------------------------------------------------------</center>`);

        return res.redirect('/admincp/customers/pendingRequests');
    }
    res.redirect('/');
}));

module.exports = router;