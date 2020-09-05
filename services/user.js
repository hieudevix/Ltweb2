const Sequelize = require('sequelize');
const Model = Sequelize.Model;
const db = require('./db');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

class User extends Model {
    async authUser(action) {
        this.status = action;
        return this.save();
    };

    async saveProfileNoFile(email, displayName, identification, numberId, dateRange) {
        this.email = email;
        this.displayName = displayName;
        this.identification = identification;
        this.numberId = numberId;
        this.dateRange = dateRange;
        return this.save();
    };

    async saveProfile(avatar, imgId, email, displayName, identification, numberId, dateRange) {
        this.avatar = avatar;
        this.imgId = imgId;
        this.email = email;
        this.displayName = displayName;
        this.identification = identification;
        this.numberId = numberId;
        this.dateRange = dateRange;
        return this.save();
    };

    async addToken() {
        this.token = crypto.randomBytes(3).toString('hex').toUpperCase();
        return this.save();
    };

    async tokenNull() {
        this.token = null;
        return this.save();
    };

    async updatePassword(hashedPassword) {
        this.password = hashedPassword;
        return this.save();
    };

    static async findById(id) {
        return User.findByPk(id);
    };

    static async findByEmail(email) {
        return User.findOne({
            where: {
                email
            }
        });
    };

    static async findByUsername(username) {
        return User.findOne({
            where: {
                username
            }
        });
    };

    static async findTokenNull() {
        return User.findAll({
            where: {
                token: null
            }
        });
    };

    static hashPassword(password) {
        return bcrypt.hashSync(password, 10);
    };

    static verifyPassword(password, hashedPassword) {
        return bcrypt.compareSync(password, hashedPassword);
    };
}
User.init({
    username: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: Sequelize.STRING,
    },
    displayName: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    avatar: {
        type: Sequelize.BLOB,
        defaultValue: null
    },
    identification: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    numberId: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
    },
    dateRange: {
        type: Sequelize.DATEONLY,
        allowNull: false,
    },
    imgId: {
        type: Sequelize.BLOB,
        allowNull: false
    },
    token: {
        type: Sequelize.STRING,
        defaultValue: null
    },
    isStaff: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    locate: {
        type: Sequelize.STRING,
        defaultValue: null
    },
    status: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0, // 0.Chưa xác thực/ 1.Đã xác thực/ 2.Khóa/ -1. Từ chối
    },
}, {
    sequelize: db,
    modelName: 'user'
});

module.exports = User;