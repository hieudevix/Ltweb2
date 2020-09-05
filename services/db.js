const Sequelize = require('sequelize');

connectionString = process.env.DATABASE_URL || 'postgres://postgres:091099@localhost:5432/sala1';
const db = new Sequelize(connectionString);

module.exports = db;