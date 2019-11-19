const fs = require('fs');
const request = require('request');

const config = JSON.parse(fs.readFileSync('../config.json', 'utf8'));

const BASE_URL = 'https://edelivery.capiot.com/api';

let TOKEN = '';

const e = {};

function get(path) {
    return new Promise((resolve, reject) => {
        request({
            method: 'post',
            url: BASE_URL + '/login',
            body: JSON.stringify({
                username: config.edelivery.username,
                password: config.edelivery.password
            })
        }, function (err1, res1, token) {
            if (err1) {
                reject(err1);
            } else {
                request({
                    method: 'get',
                    url: BASE_URL + path,
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Auth': token
                    },
                    json: true
                }, function (err2, res2, body) {
                    if (err2) {
                        reject(err2);
                    } else {
                        resolve(body);
                    }
                });
            }
        });
    });
}

e.listReleases = () => {
    return get('/resources/Releases/ODP/');
};

e.getImages = (release) => {
    return get(`/resources/Releases/ODP/${release}/Images`);
};

module.exports = e;