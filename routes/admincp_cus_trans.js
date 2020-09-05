const { Router } = require('express');
const asyncHandler = require('express-async-handler');
const random = require('random');
const moment = require('moment');
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
    const arr_trans = [];
    if (user) {
        const acc = await Account.findAllAccount(user.id);
        for (let i = 0; i < acc.length; i++) {
            const trans = await Transaction.filterTransactionAccNumALL(acc[i].account_number);
            trans.forEach(item => {
                arr_trans.push(item)
            });
        }

        return res.render('admincp/cus_trans', { staff: req.currentUser, user, trans: arr_trans, countPendingAuthCus, alert, acc_number, amount, page_name: 'cus_trans' });
    }
    res.redirect('/');
}));

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
        await Transaction.add(trans_code + 'c', 'Trong hệ thống SLB', acc.account_number, acc.account_number, user.displayName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, 'd').replace(/Đ/g, 'D').toUpperCase(), null, _sotien, 0, '#' + user.displayName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, 'd').replace(/Đ/g, 'D').toUpperCase() + ' NOP TIEN MAT', currBalanceCredit, 'GD đã hoàn tất', true, null, true, acc.id);
        await acc.updateBalance(currBalanceCredit, avaiBalanceCredit);
        await Email.send(user.email, 'mailalert - SalaBank <no-reply>', `SalaBank - Kính gửi Quý khách hàng.<br>SLB trân trọng thông báo tài khoản <b>${acc.account_number}</b> của Quý khách đã thay đổi số dư như sau:<br>Số dư mới của tài khoản trên là: <b>${new Intl.NumberFormat('vi').format(acc.current_balance)} ${acc.currency}</b> tính đến <b>${moment().format('DD/MM/yyyy')}</b>.<br>Giao dịch mới nhất: Ghi có <b>+${new Intl.NumberFormat('vi').format(_sotien)} ${acc.currency}</b>.<br>Nội dung giao dịch: <b>#${user.displayName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, 'd').replace(/Đ/g, 'D').toUpperCase()} NOP TIEN MAT</b>.<br><br>Cảm ơn Quý khách hàng đã sử dụng Sản phẩm/ Dịch vụ của SLB.<br>Chúng tôi mong được tiếp tục phục vụ Quý khách hàng.<br>Trân trọng.<br><br><br><center>-------------------------------------------------------------------------------------------------</center><br><center>Đây là dịch vụ Email tự động của SLB, Quý khách vui lòng không "Reply".</center><br><center>-------------------------------------------------------------------------------------------------</center>`);

        return res.redirect(`/admincp/customers/trans/Request?username=${user.username}&acc_number=${req.body.account_number}&amount=${_sotien}&alert=1`);
    }
    res.redirect('/');
}));

module.exports = router;