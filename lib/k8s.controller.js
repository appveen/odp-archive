const log4js = require('log4js');
const k8sClient = require('./k8s.client');

const logger = log4js.getLogger('Controller');
const modules = ['b2b', 'b2bgw', 'dm', 'gw', 'mon', 'mongo', 'nats', 'ne', 'nginx', 'pm', 'redis', 'sec', 'sm', 'user', 'wf'];
const e = {};

/**
 * @param {string} release
 * @param {number} scale
 */
e.listDeployments = (release) => {
    const namespace = 'v' + release.split('.').join('-');
    const arr = [];
    modules.forEach(name => {
        const payload = {
            "kind": "Scale",
            "apiVersion": "autoscaling/v1",
            "metadata": {
                "name": name,
                "namespace": namespace
            },
            "spec": {
                "replicas": parseInt(scale, 10)
            }
        };
        const path = `/apis/apps/v1/namespaces/${namespace}/deployments/`;
        return k8sClient.get(path).then(res => {
            if (res.statusCode !== 200) {
                logger.warn(res.statusCode, res.body);
            }
            resolve(res);
        }).catch(err => {
            logger.error(err);
            reject(err);
        });
    });
    return Promise.all(arr);
};

/**
 * @param {string} release
 * @param {number} scale
 */
e.scale = (release, scale) => {
    const namespace = 'v' + release.split('.').join('-');
    const arr = [];
    modules.forEach(name => {
        const payload = {
            "kind": "Scale",
            "apiVersion": "autoscaling/v1",
            "metadata": {
                "name": name,
                "namespace": namespace
            },
            "spec": {
                "replicas": parseInt(scale, 10)
            }
        };
        const path = `/apis/apps/v1/namespaces/${namespace}/deployments/${name}/scale`;
        arr.push(new Promise((resolve, reject) => {
            k8sClient.put(path, payload).then(res => {
                if (res.statusCode !== 200) {
                    logger.warn(res.statusCode, res.body);
                } else {
                    const message = scale == 1 ? 'Scaled Up' : 'Scaled Down'
                    logger.info(namespace, name, message);
                }
                resolve(res);
            }).catch(err => {
                logger.error(err);
                reject(err);
            });
        }));
    });
    return Promise.all(arr);
};

module.exports = e;