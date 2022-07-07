'use strict';
/* Data Access Object (DAO) module for accessing the data contained inside the db */

const sqlite = require('sqlite3');
const bcrypt = require('bcrypt');

// open the database 
const db = new sqlite.Database('questionnaire.db', (err) => {
  if(err) throw err;
});


exports.getUserInfo = (email, password) => { 
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM users WHERE email=?';
        db.get(sql, [email], (err, row) => {
            if (err) 
                reject(err);
            else if (row === undefined)   //nessun utente trovato all'interno del db
                resolve(false); 
            else {                        //utente trovato            
                const user = {id: row.id, username: row.email, name: row.name};
                bcrypt.compare(password, row.hash).then(result => { //check if the two hashes match with an async call
                    if(result)
                        resolve(user);      //password corretta --> manda info dell'account
                    else
                        resolve(false);     //rigetta login (password errata)
                });
            }
        });
    });
};


exports.getUserInfoById = (id) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM users WHERE id = ?';
        db.get(sql, [id], (err, row) => {
            if (err) 
                reject(err);
            else if (row === undefined) 
                resolve({error: 'User not found.'});
            else {
                const user = {id: row.id, username: row.email, name: row.name}
                resolve(user);
            }
        });
    });
};