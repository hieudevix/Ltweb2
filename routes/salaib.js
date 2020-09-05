const { Router } = require('express');
const asyncHandler = require('express-async-handler');
const moment = require('moment');
const Account = require('../services/account');
const Transaction = require('../services/transaction');
const User = require('../services/user');
const Email = require('../services/email');
const random = require('random');

const router = new Router();

router.get('/', (req, res) => {
    if (!req.currentUser) {
        return res.redirect('/');
    }
    if (req.currentUser && req.currentUser.isStaff) {
        return res.redirect('/admincp');
    }
    res.redirect('/salaib/Request?operationName=thong_tin_tai_khoan&operationNameChild=no_child');
});

router.get('/Request', asyncHandler(async (req, res) => {
    if (!req.currentUser) {
        return res.redirect('/');
    }
    if (req.currentUser && req.currentUser.isStaff) {
        return res.redirect('/admincp');
    }

    // GET - THONG TIN TAI KHOAN
    if (req.query.operationName === 'thong_tin_tai_khoan' && req.query.operationNameChild === 'no_child') {
        // GET - THONG TIN TAI KHOAN CHI TIET
        const allAccount = await Account.findAllAccount(req.currentUser.id);
        if (req.query.accountNbr) {
            const chkHaveAccount = await Account.findUserAccount(req.currentUser.id, req.query.accountNbr);
            if (chkHaveAccount.length == '') { return res.redirect('/') };

            const arr_trans = await Transaction.filterTransactionAccNum(req.query.accountNbr);
            let beginBalance = 0;
            let endBalance = 0;
            if (arr_trans.length != 0) {
                beginBalance = Number(arr_trans[0].current_balance) + Number(arr_trans[0].debited) - Number(arr_trans[0].credited);
                endBalance = Number(arr_trans[arr_trans.length - 1].current_balance);
            }
            const acc = await Account.findOne({ where: { account_number: req.query.accountNbr } });
            const currency = acc.currency;

            let sum_withdrawal = 0;
            let sum_deposit = 0;
            for (let i = 0; i < arr_trans.length; i++) {
                sum_withdrawal += Number(arr_trans[i].debited);
                sum_deposit += Number(arr_trans[i].credited);
            }

            return res.render('thong_tin_tai_khoan_chi_tiet', { account: allAccount, account_selected: req.query.accountNbr, arr_trans, fromDate: null, toDate: null, monthDate: moment().format('MM'), yearDate: moment().format('yyyy'), beginBalance, endBalance, sum_withdrawal, sum_deposit, currency, page_name: 'thong_tin_tai_khoan_chi_tiet' });
        }
        return res.render('thong_tin_tai_khoan', { tttk: allAccount, page_name: 'thong_tin_tai_khoan' });
    }

    const account = await Account.findPaymentAccount(req.currentUser.id);
    // GET - LIET KE GD ONLINE
    if (req.query.operationName === 'liet_ke_giao_dich_online' && req.query.operationNameChild === 'no_child') {
        const arr_trans = [];
        for (let i = 0; i < account.length; i++) {
            const trans = await Transaction.findAllTrans(account[i].id);
            trans.forEach(item => {
                arr_trans.push(item)
            });
        }
        arr_trans.sort((a, b) => { return new Date(b.date_create).getTime() - new Date(a.date_create).getTime(); });
        return res.render('liet_ke_giao_dich_online', { account, account_selected: req.body.account, account_status: 'all', arr_trans, fromDate: null, toDate: null, page_name: 'liet_ke_giao_dich_online' });

    }

    // GET - CHUYEN KHOAN TRONG SLB
    if (req.query.operationName === 'chuyen_khoan_trong_slb' && req.query.operationNameChild === 'no_child') {
        return res.render('chuyen_khoan_trong_slb', { account, account_selected: req.body.tktrichtien, tktrichtien: null, tkthuhuong: null, thtt_user: null, tktthuongUser: null, sotien: null, phigd: null, content: null, error: null, error_code: 0, page_name: 'chuyen_khoan_trong_slb' });
    }

    // GET - CHUYEN KHOAN NGOAI SLB
    if (req.query.operationName === 'chuyen_khoan_ngoai_slb' && req.query.operationNameChild === 'no_child') {
        return res.render('chuyen_khoan_ngoai_slb', { page_name: 'chuyen_khoan_ngoai_slb' });
    }

    // GET - TIEN GUI CO KY HAN > Mo Tai Khoan
    if (req.query.operationName === 'tien_gui_co_ky_han' && req.query.operationNameChild === 'mo_tai_khoan') {


        return res.render('tien_gui_co_ky_han_motk', { account, account_selected: req.body.tktrichtien, tktrichtien: null, sotien: null, error: null, error_code: null, page_name: 'tien_gui_co_ky_han_motk' });
    }

    // GET - TIEN GUI CO KY HAN > Tat Toan Tai Khoan
    if (req.query.operationName === 'tien_gui_co_ky_han' && req.query.operationNameChild === 'tat_toan_tai_khoan') {
        

        return res.render('tien_gui_co_ky_han_tattoan', { account, account_selected: req.body.tktrichtien, tktrichtien: null, sotien: null, error: null, error_code: null, page_name: 'tien_gui_co_ky_han_tattoan' });
    }

    res.redirect('/');
}));

router.post('/Request', asyncHandler(async (req, res) => {
    const account = await Account.findPaymentAccount(req.currentUser.id);

    //POST - THONG TIN TAI KHOAN CHI TIET
    if (req.query.operationName === 'thong_tin_tai_khoan' && req.query.operationNameChild === 'no_child' && req.query.accountNbr) {
        const allAccount = await Account.findAllAccount(req.currentUser.id);
        const chkHaveAccount = await Account.findUserAccount(req.currentUser.id, req.body.accountNbr);
        if (chkHaveAccount.length == '') { return res.redirect('/') };
        let arr_trans;

        const fromDate = req.body.fromDate;
        const toDate = req.body.toDate;
        _fromDate = new Date(fromDate.split('/').reverse().join('/') + ' 00:00:00 UTC').toISOString();
        _toDate = new Date(toDate.split('/').reverse().join('/') + ' 23:59:59 UTC').toISOString();

        if (req.body.btnViewDay) {
            arr_trans = await Transaction.filterTransactionAccNumDate(req.body.accountNbr, _fromDate, _toDate);
        }
        else {
            arr_trans = await Transaction.filterTransactionAccNumMonth(req.body.accountNbr, req.body.monthDate, req.body.yearDate);
        }

        let beginBalance = 0;
        let endBalance = 0;
        const acc = await Account.findOne({ where: { account_number: req.body.accountNbr } });
        const currency = acc.currency;
        let sum_withdrawal = 0;
        let sum_deposit = 0;
        if (arr_trans.length != '') {
            beginBalance = Number(arr_trans[0].current_balance) + Number(arr_trans[0].debited) - Number(arr_trans[0].credited);
            endBalance = Number(arr_trans[arr_trans.length - 1].current_balance);

            for (let i = 0; i < arr_trans.length; i++) {
                sum_withdrawal += Number(arr_trans[i].debited);
                sum_deposit += Number(arr_trans[i].credited);
            }
        }

        return res.render('thong_tin_tai_khoan_chi_tiet', { account: allAccount, account_selected: req.body.accountNbr, arr_trans, fromDate, toDate, monthDate: req.body.monthDate, yearDate: req.body.yearDate, beginBalance, endBalance, sum_withdrawal, sum_deposit, currency, page_name: 'thong_tin_tai_khoan_chi_tiet' });
    }

    // POST - LIET KE GD ONLINE
    if (req.query.operationName === 'liet_ke_giao_dich_online' && req.query.operationNameChild === 'no_child') {
        const fromDate = req.body.fromDate;
        const toDate = req.body.toDate;
        _fromDate = new Date(fromDate.split('/').reverse().join('/') + ' 00:00:00 UTC').toISOString();
        _toDate = new Date(toDate.split('/').reverse().join('/') + ' 23:59:59 UTC').toISOString();
        dp_fromDate = Date.parse(_fromDate);
        dp_toDate = Date.parse(_toDate);

        const arr_trans = [];
        for (let i = 0; i < account.length; i++) {
            const trans = await Transaction.findAllTrans(account[i].id);
            trans.forEach(item => {
                arr_trans.push(item)
            });
        }
        arr_trans.sort((a, b) => { return new Date(b.date_create).getTime() - new Date(a.date_create).getTime(); });

        const filtered = [];
        for (let i = 0; i < arr_trans.length; i++) {
            const btw_date = dp_fromDate <= Date.parse(arr_trans[i].date_create) && Date.parse(arr_trans[i].date_create) <= dp_toDate;
            if (req.body.account == 'all' && req.body.status == 'all' && btw_date) {
                filtered.push(arr_trans[i]);
            }
            else if (req.body.account == 'all') {
                if (req.body.status == arr_trans[i].status && btw_date) {
                    filtered.push(arr_trans[i]);
                }
            }
            else if (req.body.status == 'all') {
                if (req.body.account == arr_trans[i].from_account_number && btw_date) {
                    filtered.push(arr_trans[i]);
                }
            }
            else {
                if (req.body.account == arr_trans[i].from_account_number && req.body.status == arr_trans[i].status && btw_date) {
                    filtered.push(arr_trans[i]);
                }
            }
        }
        return res.render('liet_ke_giao_dich_online', { account, account_selected: req.body.account, account_status: req.body.status, arr_trans: filtered, fromDate, toDate, page_name: 'liet_ke_giao_dich_online' });
    }

    // POST - CHUYEN KHOAN TRONG SLB
    if (req.query.operationName === 'chuyen_khoan_trong_slb' && req.query.operationNameChild === 'no_child') {
        const tktt = await Account.findOne({ where: { account_number: req.body.tktrichtien } });
        let thtt_user;
        if (tktt) { thtt_user = await User.findOne({ where: { id: tktt.userId } }) };
        const tkth = await Account.findOne({ where: { account_number: req.body.tkthuhuong } });
        let thth_user;
        if (tkth) { thth_user = await User.findOne({ where: { id: tkth.userId } }) };
        let sotien = req.body.sotien;
        sotien = sotien.replace(/,/g, '.');
        let _sotien = req.body.sotien;
        _sotien = _sotien.replace(/,/g, '');
        _sotien = _sotien.replace(/\./g, '');
        const phigd = 0;
        let content = req.body.noidunggd;

        // Auth Trans - Go Back
        if (req.body.btnGoback) {
            let content = req.body.content;
            content = content.replace('IB ' + thtt_user.displayName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, 'd').replace(/Đ/g, 'D').toUpperCase() + ' ', '');
            return res.render('chuyen_khoan_trong_slb', { account, account_selected: req.body.tktrichtien, tktrichtien: tktt, tkthuhuong: tkth, thtt_user, tktthuongUser: thth_user, sotien: new Intl.NumberFormat('vi').format(sotien), phigd: new Intl.NumberFormat('vi').format(req.body.phigd), content, error: null, error_code: null, page_name: 'chuyen_khoan_trong_slb' });
        }

        // Result - Auth Trans
        if (req.body.btnAuthOK) {
            const auth_errors = [];
            const user = await User.findById(req.currentUser.id);
            if (!user || !User.verifyPassword(req.body.auth_password, user.password)) {
                auth_errors.push('Sai mật khẩu đăng nhập!');
            }
            const auth_trans = await Transaction.findOne({ where: { trans_code: req.body.trans_code, OTP_code: req.body.auth_otp_email } });
            if (!auth_trans) {
                auth_errors.push('Sai mã OTP Email!');
            }

            if (auth_trans && auth_trans.status == 'GD đã hoàn tất') {
                return res.redirect('/');
            }

            if (auth_errors.length != 0) {
                const _auth_trans = await Transaction.findOne({ where: { trans_code: req.body.trans_code } });
                await _auth_trans.NotdoneDebitedTrans();
                return res.render('result_trans', { auth_errors, page_name: 'result_trans' });
            }

            const currBalanceDebit = Number(tktt.current_balance) - Number(req.body.sotien);
            const avaiBalanceDebit = Number(tktt.available_balance) - Number(req.body.sotien);
            await auth_trans.doneDebitedTrans(currBalanceDebit);
            await tktt.updateBalance(currBalanceDebit, avaiBalanceDebit);
            await Email.send(thtt_user.email, 'mailalert - SalaBank <no-reply>', `SalaBank - Kính gửi Quý khách hàng.<br>SLB trân trọng thông báo tài khoản <b>${tktt.account_number}</b> của Quý khách đã thay đổi số dư như sau:<br>Số dư mới của tài khoản trên là: <b>${new Intl.NumberFormat('vi').format(tktt.current_balance)} ${tktt.currency}</b> tính đến <b>${moment().format('DD/MM/yyyy')}</b>.<br>Giao dịch mới nhất: Ghi nợ <b>-${new Intl.NumberFormat('vi').format(req.body.sotien)} ${tktt.currency}</b>.<br>Nội dung giao dịch: <b>${req.body.content}</b>.<br><br>Cảm ơn Quý khách hàng đã sử dụng Sản phẩm/ Dịch vụ của SLB.<br>Chúng tôi mong được tiếp tục phục vụ Quý khách hàng.<br>Trân trọng.<br><br><br><center>-------------------------------------------------------------------------------------------------</center><br><center>Đây là dịch vụ Email tự động của SLB, Quý khách vui lòng không "Reply".</center><br><center>-------------------------------------------------------------------------------------------------</center>`);

            const currBalanceCredit = Number(tkth.current_balance) + Number(req.body.sotien);
            const avaiBalanceCredit = Number(tkth.available_balance) + Number(req.body.sotien);
            await Transaction.add(req.body.trans_code + 'c', 'Trong hệ thống SLB', req.body.tktrichtien, req.body.tkthuhuong, req.body.beneficiary_unit, null, Number(req.body.sotien), phigd, req.body.content, currBalanceCredit, 'GD đã hoàn tất', false, null, true, tktt.id);
            await tkth.updateBalance(currBalanceCredit, avaiBalanceCredit);
            await Email.send(thth_user.email, 'mailalert - SalaBank <no-reply>', `SalaBank - Kính gửi Quý khách hàng.<br>SLB trân trọng thông báo tài khoản <b>${tkth.account_number}</b> của Quý khách đã thay đổi số dư như sau:<br>Số dư mới của tài khoản trên là: <b>${new Intl.NumberFormat('vi').format(tkth.current_balance)} ${tkth.currency}</b> tính đến <b>${moment().format('DD/MM/yyyy')}</b>.<br>Giao dịch mới nhất: Ghi có <b>+${new Intl.NumberFormat('vi').format(req.body.sotien)} ${tkth.currency}</b>.<br>Nội dung giao dịch: <b>${req.body.content}</b>.<br><br>Cảm ơn Quý khách hàng đã sử dụng Sản phẩm/ Dịch vụ của SLB.<br>Chúng tôi mong được tiếp tục phục vụ Quý khách hàng.<br>Trân trọng.<br><br><br><center>-------------------------------------------------------------------------------------------------</center><br><center>Đây là dịch vụ Email tự động của SLB, Quý khách vui lòng không "Reply".</center><br><center>-------------------------------------------------------------------------------------------------</center>`);

            return res.render('result_trans', { auth_errors: null, page_name: 'result_trans' });
        }

        // Catch Errors
        let error;
        let error_code;
        if (!tktt) { error = 'Chưa chọn tài khoản trích tiền.'; error_code = 1; }
        else {
            if (req.body.tkthuhuong == '') { error = 'Vui lòng nhập số tài khoản thụ hưởng!'; error_code = 2; }
            else if (!tkth) {
                error = 'Tài khoản thụ hưởng ' + req.body.tkthuhuong + ' không tồn tại!';
                error_code = 2;
            }
            else if (tkth && tkth.account_number == req.body.tktrichtien) {
                error = 'Không thể chuyển khoản cho tài khoản trích tiền!';
                error_code = 2;
            }
            else {
                if (!req.body.sotien) {
                    error = 'Vui lòng nhập số tiền muốn chuyển.';
                    error_code = 3;
                }
                else if (Number(_sotien) < 5000) {
                    error = 'Vui lòng nhập số tiền (tối thiểu 5.000 đồng)';
                    error_code = 3;
                }
                else if (Number(_sotien) > Number(tktt.available_balance)) {
                    error = 'Số dư khả dụng hiện tại không đủ!';
                    error_code = 3;
                }
                else {
                    if (req.body.chuyenkhoanngay != 'on') {
                        error = 'Vui lòng chọn thời gian chuyển!';
                        error_code = 4;
                    }
                    else {
                        if (req.body.ppxacthuc == '') {
                            error = 'Vui lòng nhập Nội dung giao dịch(nếu có) rồi chọn phương pháp xác thực!';
                            error_code = 5;
                        }
                    }
                }
            }
        }

        // Render
        if (error != null) {
            return res.render('chuyen_khoan_trong_slb', { account, account_selected: req.body.tktrichtien, tktrichtien: tktt, tkthuhuong: tkth, thtt_user, tktthuongUser: thth_user, sotien, phigd, content, error, error_code, page_name: 'chuyen_khoan_trong_slb' });
        }

        const OTP_code = random.int(min = 1000000, max = 9999999).toString();
        let _trans;
        let trans_code;
        do {
            trans_code = random.int(min = 111111111, max = 999999999).toString();
            _trans = await Transaction.findOne({ where: { trans_code } });
        } while (_trans);

        if (!content) {
            content = 'IB ' + req.body.glbHoTenKH + ' CK ' + req.body.beneficiary_unit;
        }
        else {
            content = 'IB ' + req.body.glbHoTenKH + ' ' + req.body.noidunggd.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, 'd').replace(/Đ/g, 'D').toUpperCase();
        }

        await Transaction.add(trans_code, 'Trong hệ thống SLB', req.body.tktrichtien, req.body.tktrichtien, req.body.beneficiary_unit, _sotien, null, phigd, content, null, 'GD đang chờ xử lý', false, OTP_code, false, tktt.id);
        trans = await Transaction.findOne({ where: { trans_code } });
        await Email.send(thtt_user.email, 'SalaBank - Internet Banking - OTP Verification <no-reply>', `SLB Online: Mã xác thực OTP của giao dịch <b>${trans.trans_code}</b> là <b>${trans.OTP_code}</b>. Quý khách đang thực hiện Chuyển khoản trong SLB, số tiền: <b>${trans.debited ? new Intl.NumberFormat('vi').format(trans.debited) : new Intl.NumberFormat('vi').format(trans.credited)} ${tktt.currency}</b>.`);

        return res.render('auth_trans', { trans, auth_tktt: tktt, auth_tkth: req.body.tkthuhuong, page_name: 'auth_trans' });
    }

    // POST - TIEN GUI CO KY HAN > Mo Tai Khoan
    if (req.query.operationName === 'tien_gui_co_ky_han' && req.query.operationNameChild === 'mo_tai_khoan') {


        return res.render('tien_gui_co_ky_han_motk', { account, account_selected: req.body.tktrichtien, tktrichtien: null, sotien: null, error: null, error_code: null, page_name: 'tien_gui_co_ky_han_motk' });
    }

    // POST - TIEN GUI CO KY HAN > Tat Toan Tai Khoan
    if (req.query.operationName === 'tien_gui_co_ky_han' && req.query.operationNameChild === 'tat_toan_tai_khoan') {


        return res.render('tien_gui_co_ky_han_tattoan', { account, account_selected: req.body.tktrichtien, tktrichtien: null, sotien: null, error: null, error_code: null, page_name: 'tien_gui_co_ky_han_tattoan' });
    }
}));

module.exports = router;