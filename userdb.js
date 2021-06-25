var fs = require('fs');
var file = './config/user.db';
var exists = fs.existsSync(file);
//load sqlite3
var sqlite3 = require('sqlite3').verbose();

//new a database
var db = new sqlite3.Database(file);



function initdb(action) {
    var msg;
    db.serialize( function() {
        //db.run create if not exist
        db.run('CREATE TABLE IF NOT EXISTS user (userId TEXT, nonce TEXT)');
    
        msg = action();
    });

    return msg;
}

function addData (userId, nonce) {

    getData(userId, (error, row) => {
        
        if (error != null) {
            var action = () => {
                var sqlAdd = 'INSERT INTO user(userId,nonce) VALUES (?,?)';
                db.run(sqlAdd,[userId, nonce]); 
            
                return 'append finished';
            };
        
            return initdb(action);
        }
        else {
            return updateData(userId, nonce);
        }
    })
    
}

function updateData (userId, nonce) {

    var action = () => {
        var sqlUpdate = 'update user set nonce=? where userId=?';
        db.run(sqlUpdate, [nonce, userId]);
        return 'update finished';
    };
  
    return initdb(action);
}

function getData (userId, callback) {
    var action =() => {
        var sqlGet = 'SELECT rowid AS No, userId, nonce From user where userId=?';
        var rowData = null;
        var error = null;
        db.each(sqlGet, userId, function (err, row) {
            if (err != null) {
                error = err;
            } else {
                rowData = row;
            }
        }, function (err, count) {
            if (count == 0) {
                error = count;
            }

            callback(error, rowData);
        });

        return 'get token finished';
    };

    return initdb(action);
}


function removeData (userId) {

    var action = () => {
        var sqlRemove = 'delete from user where userId=?';
        db.run(sqlRemove, [userId]);
        return 'remove finished';
    };
    
    return initdb(action);
}

module.exports = {
    addData,
    updateData,
    getData,
    removeData,
}