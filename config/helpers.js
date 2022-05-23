const Mysqli = require('mysqli');
const conn = new Mysqli({
    host: 'localhost', // IP/domain name 
    post: 3306, //port, default 3306 
    user: 'root', //user name 
    passwd: '', //password 
    db: 'shoping_store' // You can specify the database or not [optional] 
});
let db = conn.emit(false, ''); //if you have multiple database
module.exports = {
    database: db
};