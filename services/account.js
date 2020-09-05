const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const Model = Sequelize.Model;
const db = require('./db');
const User = require('./user');

class Account extends Model {
    async updateBalance(current_balance, available_balance) {
        this.current_balance = current_balance;
        this.available_balance = available_balance;
        return this.save();
    }

    static async findAllAccountNotClosed(userId) {
        return Account.findAll({
            where: {
                userId,
                isClosed: false
            },
            order: [
                ['id', 'ASC'],
            ]
        });
    }

    static async findAllAccount(userId) {
        return Account.findAll({
            where: {
                userId,
            },
            order: [
                ['id', 'ASC'],
            ]
        });
    }

    static async findUserAccount(userId, account_number) {
        return Account.findAll({
            where: {
                userId,
                account_number
            },
            order: [
                ['id', 'ASC'],
            ]
        });
    }

    static async findPaymentAccount(userId) {
        return Account.findAll({
            where: {
                userId,
                account_number: {
                    [Op.like]: '2%',
                }
            },
            order: [
                ['id', 'ASC'],
            ]
        });
    }

    static add(account_number, account_opening_unit, current_balance, available_balance, currency, date_due, open_day, close_date, period, annual_interest_rate, product, isClosed, userId) {
        return Account.create({ account_number, account_opening_unit, current_balance, available_balance, currency, date_due, open_day, close_date, period, annual_interest_rate, product, isClosed, userId });
    }
}
Account.init({
    account_number: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
    },
    account_opening_unit: {
        type: Sequelize.STRING,
        allowNull: false
    },
    current_balance: {
        type: Sequelize.DECIMAL,
        allowNull: false
    },
    available_balance: {
        type: Sequelize.DECIMAL,
        allowNull: false
    },
    currency: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'VND'
    },
    date_due: {
        type: Sequelize.DATE,
    },
    open_day: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
    },
    close_date: {
        type: Sequelize.DATE
    },
    period: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    annual_interest_rate: {
        type: Sequelize.DECIMAL,
        allowNull: false,
        defaultValue: 0
    },
    product: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'TGTT KHTN (CA NHAN)'
    },
    isClosed: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
}, {
    sequelize: db,
    modelName: 'account'
});

User.hasMany(Account);
Account.belongsTo(User);

module.exports = Account;