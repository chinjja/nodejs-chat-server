const bcrypt = require('bcrypt-nodejs');

function genSalt(rounds) {
    if(!rounds) rounds = 10;

    return new Promise((resolve, reject) => {
        bcrypt.genSalt(rounds, (error, result) => {
            if(error) {
                reject(error);
            } else {
                resolve(result);
            }
        });
    });
}

function hash(password, salt) {
    return new Promise(async (resolve, reject) => {
        if(typeof salt == 'undefined') {
            salt = await genSalt();
        }
        bcrypt.hash(password, salt, null, (error, result) => {
            if(error) {
                reject(error);
            } else {
                resolve(result);
            }
        });
    });
}

function compare(password, hash) {
    return new Promise((resolve, reject) => {
        bcrypt.compare(password, hash, (error, ok) => {
            if(error) {
                reject(error);
            } else {
                resolve(ok);
            }
        });
    });
}

module.exports.genSalt = genSalt;
module.exports.hash = hash;
module.exports.compare = compare;