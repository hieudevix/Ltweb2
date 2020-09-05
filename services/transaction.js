const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const Model = Sequelize.Model;
const db = require('./db');
const Account = require('./account');

class Transaction extends Model {

    async doneDebitedTrans(current_balance) {
        this.current_balance = current_balance,
            this.status = 'GD đã hoàn tất',
            //this.OTP_code = null,
            this.isCustomerAuth = true;
        return this.save();
    }

    async NotdoneDebitedTrans() {
        this.current_balance = null,
            this.status = 'GD do ngân hàng từ chối xử lý',
            this.isCustomerAuth = false;
        return this.save();
    }

    static async findAllTrans(accountId) {
        return Transaction.findAll({
            where: {
                accountId,
                credited: null
            },
        });
    }

    static async filterTransactionAccNum(from_account_number) {
        return Transaction.findAll({
            where: {
                [Op.or]: [{ from_account_number, credited: null }, { to_account_number: from_account_number, debited: null }],
                [Op.and]: [{ isCustomerAuth: true }, { status: 'GD đã hoàn tất' }]
            },
            order: [
                ['date_create', 'ASC'],
            ]
        });
    }

    static async filterTransactionAccNumALL(from_account_number) {
        return Transaction.findAll({
            where: {
                [Op.or]: [{ from_account_number, credited: null }, { to_account_number: from_account_number, debited: null }],
                [Op.and]: [{ isCustomerAuth: true }]
            },
            order: [
                ['date_create', 'DESC'],
            ]
        });
    }

    static async filterTransactionAccNumDate(from_account_number, fromDate, toDate) {
        return Transaction.findAll({
            where: {
                [Op.or]: [{ from_account_number, credited: null }, { to_account_number: from_account_number, debited: null }],
                [Op.and]:
                    [{ isCustomerAuth: true }, { status: 'GD đã hoàn tất' },
                    { date_create: { [Op.between]: [fromDate, toDate] } }]
            },
            order: [
                ['date_create', 'ASC'],
            ]
        });
    }

    static async filterTransactionAccNumMonth(from_account_number, monthDate, yearDate) {
        return Transaction.findAll({
            where: {
                [Op.or]: [{ from_account_number, credited: null }, { to_account_number: from_account_number, debited: null }],
                [Op.and]:
                    [
                        { isCustomerAuth: true }, { status: 'GD đã hoàn tất' },
                        Sequelize.where(Sequelize.fn('date_part', 'month', Sequelize.col('date_create')), monthDate),
                        Sequelize.where(Sequelize.fn('date_part', 'year', Sequelize.col('date_create')), yearDate),
                    ]
            },
            order: [
                ['date_create', 'ASC'],
            ]
        });
    }
    static async filterTransaction(from_account_number, status) {
        return Transaction.findAll({
            where: {
                from_account_number,
                status
            },
            order: [
                ['date_create', 'DESC'],
            ]
        });
    }

    static add(trans_code, type_transfer, from_account_number, to_account_number, beneficiary_unit, debited, credited, fee, content, current_balance, status, isOutSide, OTP_code, isCustomerAuth, accountId) {
        return Transaction.create({ trans_code, type_transfer, from_account_number, to_account_number, beneficiary_unit, debited, credited, fee, content, current_balance, status, isOutSide, OTP_code, isCustomerAuth, accountId });
    }
}
Transaction.init({
    trans_code: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false
    },
    date_create: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
    },
    type_transfer: {
        type: Sequelize.STRING,
        allowNull: false
    },
    from_account_number: {
        type: Sequelize.STRING,
        allowNull: false
    },
    to_account_number: {
        type: Sequelize.STRING,
        allowNull: false
    },
    beneficiary_unit: {
        type: Sequelize.STRING,
        allowNull: false
    },
    debited: {
        type: Sequelize.DECIMAL,
        defaultValue: null
    },
    credited: {
        type: Sequelize.DECIMAL,
        defaultValue: null
    },
    fee: {
        type: Sequelize.DECIMAL,
        allowNull: false,
        defaultValue: 0
    },
    content: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    current_balance: {
        type: Sequelize.DECIMAL,
    },
    transfer_time: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'Chuyển khoản ngay'
    },
    status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'GD đang chờ xử lý'
    },
    isOutSide: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    OTP_code: {
        type: Sequelize.STRING
    },
    isCustomerAuth: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
}, {
    sequelize: db,
    modelName: 'transaction'
});


Account.hasMany(Transaction);
Transaction.belongsTo(Account);

module.exports = Transaction;