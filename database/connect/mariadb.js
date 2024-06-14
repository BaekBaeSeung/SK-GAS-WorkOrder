const mariadb = require('mariadb');

const conn = mariadb.createConnection({
    host: 'localhost',
    port: 3406,
    user: 'root',
    password: 'mariadb',
    database: 'test_db',
    connectionLimit: 5
});

module.exports.conn = conn;
