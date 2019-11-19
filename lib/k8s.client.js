const request = require('request');
const fs = require('fs');

const URL = 'https://kubernetes.default.svc';

let TOKEN = '';
const TOKEN_PATH = '/var/run/secrets/kubernetes.io/serviceaccount/token';
if (fs.existsSync(TOKEN_PATH)) TOKEN = fs.readFileSync(TOKEN_PATH);

const e = {};

e.get = (path) => {
    const options = {
        method: 'GET',
        url: URL + path,
        json: true,
        strictSSL: false,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + TOKEN
        },
    };
    return new Promise((resolve, reject) => {
        request(options, function (err, res, body) {
            if (err) {
                return reject(err);
            } else {
                return resolve({ statusCode: res.statusCode, body: body });
            }
        });
    });
};

e.post = (path, payload) => {
    const options = {
        method: 'POST',
        url: URL + path,
        strictSSL: false,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + TOKEN
        },
        json: true,
        body: payload,
    };
    return new Promise((resolve, reject) => {
        request(options, function (err, res, body) {
            if (err) {
                return reject(err);
            } else {
                return resolve({ statusCode: res.statusCode, body: body });
            }
        });
    });
};

e.patch = (path, payload) => {
    const options = {
        method: 'PATCH',
        url: URL + path,
        strictSSL: false,
        headers: {
            'Authorization': 'Bearer ' + TOKEN,
            'Content-Type': 'application/merge-patch+json'
        },
        json: true,
        body: payload
    };
    return new Promise((resolve, reject) => {
        request(options, function (err, res, body) {
            if (err) {
                return reject(err);
            } else {
                return resolve({ statusCode: res.statusCode, body: body });
            }
        });
    });
};

e.delete = (path, payload) => {
    const options = {
        method: 'DELETE',
        url: URL + path,
        strictSSL: false,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + TOKEN
        },
        json: true,
        body: payload
    };
    return new Promise((resolve, reject) => {
        request(options, function (err, res, body) {
            if (err) {
                return reject(err);
            } else {
                return resolve({ statusCode: res.statusCode, body: body });
            }
        });
    });
};

e.put = (path, payload) => {
    const options = {
        method: 'PUT',
        url: URL + path,
        strictSSL: false,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + TOKEN
        },
        json: true,
        body: payload
    };
    return new Promise((resolve, reject) => {
        request(options, function (err, res, body) {
            if (err) {
                return reject(err);
            } else {
                return resolve({ statusCode: res.statusCode, body: body });
            }
        });
    });
};

module.exports = e;