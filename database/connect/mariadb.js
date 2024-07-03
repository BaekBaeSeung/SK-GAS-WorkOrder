const mariadb = require('mariadb');

const conn = mariadb.createConnection({
    host: 'localhost',
    port: 3406,
    user: 'root',
    password: 'mariadb',
    database: 'test03',
    connectionLimit: 20
});

module.exports.conn = conn;
