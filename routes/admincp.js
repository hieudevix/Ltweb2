const { Router } = require('express');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const asyncHandler = require('express-async-handler');
const moment = require('moment');
const User = require('../services/user');
const Transaction = require('../services/transaction');
const Account = require('../services/account');

const router = new Router();

router.get('/', asyncHandler(async (req, res) => {
    if (!req.currentUser || !(req.currentUser && req.currentUser.isStaff)) {
        return res.redirect('/');
    }

    const sumDepositsMonth = await Transaction.sum('credited', {
        where: {
            [Op.and]:
                [
                    { isCustomerAuth: true }, { status: 'GD đã hoàn tất' }, { debited: null }, { isOutSide: true },
                    Sequelize.where(Sequelize.fn('date_part', 'month', Sequelize.col('date_create')), moment().format('MM')),
                    Sequelize.where(Sequelize.fn('date_part', 'year', Sequelize.col('date_create')), moment().format('yyyy')),
                ]
        }
    });

    const sumDepositsYear = await Transaction.sum('credited', {
        where: {
            [Op.and]:
                [
                    { isCustomerAuth: true }, { status: 'GD đã hoàn tất' }, { debited: null }, { isOutSide: true },
                    Sequelize.where(Sequelize.fn('date_part', 'year', Sequelize.col('date_create')), moment().format('yyyy')),
                ]
        }
    });

    const countPendingAuthCus = await User.count({ where: { status: 0 } });


    // Set value charDeposits
    const arrData_charDeposits = [];
    for (let i = 1; i <= 12; i++) {
        const sumDepositsMonth = await Transaction.sum('credited', {
            where: {
                [Op.and]:
                    [
                        { isCustomerAuth: true }, { status: 'GD đã hoàn tất' }, { debited: null }, { isOutSide: true },
                        Sequelize.where(Sequelize.fn('date_part', 'month', Sequelize.col('date_create')), i),
                        Sequelize.where(Sequelize.fn('date_part', 'year', Sequelize.col('date_create')), moment().format('yyyy')),
                    ]
            }
        });
        if (sumDepositsMonth) {
            arrData_charDeposits.push(sumDepositsMonth);
        }
        else {
            arrData_charDeposits.push(null);
        }
    }

    // Set value arrData_PieChartAmountAcc
    const arrData_PieChartAmountAcc = [];
    const countPaymentAcc = await Account.count({
        where: {
            [Op.and]:
                [
                    { account_number: { [Op.like]: '2%' } },
                    Sequelize.where(Sequelize.fn('date_part', 'year', Sequelize.col('open_day')), moment().format('yyyy')),
                ]
        }
    });
    if (countPaymentAcc) {
        arrData_PieChartAmountAcc.push(countPaymentAcc);
    }
    else {
        arrData_PieChartAmountAcc.push(null);
    }

    const countSaveAcc = await Account.count({
        where: {
            [Op.and]:
                [
                    { account_number: { [Op.like]: '3%' } },
                    Sequelize.where(Sequelize.fn('date_part', 'year', Sequelize.col('open_day')), moment().format('yyyy')),
                ]
        }
    });
    if (countSaveAcc) {
        arrData_PieChartAmountAcc.push(countSaveAcc);
    }
    else {
        arrData_PieChartAmountAcc.push(null);
    }

    res.render('admincp/index', { staff: req.currentUser, sumDepositsMonth, sumDepositsYear, countPendingAuthCus, arrData_charDeposits, arrData_PieChartAmountAcc, page_name: 'index' });
}));

module.exports = router;