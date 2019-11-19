const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const log4js = require('log4js');
const k8sController = require('./lib/k8s.controller');

const PORT = process.env.PORT || 8000;
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

const logger = log4js.getLogger('Server');
const app = express();


log4js.configure({
    appenders: {
        'out': {
            type: 'stdout'
        },
        server: {
            type: 'multiFile', base: 'logs/', property: 'categoryName', extension: '.log'
        }
    },
    categories: { default: { appenders: ['out', 'server'], level: LOG_LEVEL } }
});

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());

app.use((req, res, next) => {
    logger.info(req.method, req.headers['x-forwarded-for'] || req.connection.remoteAddress, req.path, req.params, req.query, req.body);
    next();
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/api/scale', (req, res) => {
    const release = req.body.release;
    let scale = req.body.scale;
    if (!release || (scale != '0' && scale != '1')) {
        res.status(400).json({ message: 'Invalid Request' });
        return;
    }
    scale = parseInt(scale, 10)
    let request;
    if (scale === 1) {
        request = k8sController.scaleUp(release);
    } else {
        request = k8sController.scaleDown(release);
    }
    request.then(data => {
        const message = release + ' scaled ' + (scale ? 'up' : 'down');
        res.status(200).json({ message: message });
    }).catch(err => {
        logger.error(err);
        res.status(500).json({ message: 'Something went wrong' });
    });
});

app.listen(PORT, (err) => {
    if (!err) {
        logger.info('Server is listening on port', PORT);
    } else {
        logger.error(err);
    }
});