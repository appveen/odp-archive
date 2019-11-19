const log4js = require('log4js');
const k8sClient = require('./k8s.client');

const logger = log4js.getLogger('Controller');
const modules = ['b2b', 'b2bgw', 'dm', 'gw', 'mon', 'mongo', 'nats', 'ne', 'nginx', 'pm', 'redis', 'sec', 'sm', 'user', 'wf'];
const e = {};


e.listNamespaces = () => {
    const path = `/api/v1/namespaces`;
    return new Promise((resolve, reject) => {
        k8sClient.get(path).then(res => {
            if (res.statusCode !== 200) {
                resolve([]);
                logger.warn(res.statusCode, res.body);
            } else {
                resolve(res.body.items.map(e => e.metadata.name));
            }
        }).catch(err => {
            logger.error(err);
            reject(err);
        });
    });
};

/**
 * @param {string} release
 * @param {number} scale
 */
e.listDeployments = (release) => {
    const namespace = 'v' + release.split('.').join('-');
    const path = `/apis/apps/v1/deployments`;
    return new Promise((resolve, reject) => {
        k8sClient.get(path).then(res => {
            if (res.statusCode !== 200) {
                resolve([]);
                logger.warn(res.statusCode, res.body);
            } else {
                const list = res.body.items.filter(e => e.metadata.namespace.startsWith(namespace)).map(e => {
                    const temp = {};
                    temp.name = e.metadata.name;
                    temp.namespace = e.metadata.namespace;
                    return temp;
                });
                resolve(list);
            }
        }).catch(err => {
            logger.error(err);
            reject(err);
        });
    });
};

/**
 * @param {string} release
 */
e.scaleDown = (release) => {
    const arr = [];
    return new Promise((resolve, reject) => {
        this.listDeployments(release).then(podList => {
            podList.forEach(item => {
                const payload = {
                    "kind": "Scale",
                    "apiVersion": "autoscaling/v1",
                    "metadata": {
                        "name": item.name,
                        "namespace": item.namespace
                    },
                    "spec": {
                        "replicas": 0
                    }
                };
                const path = `/apis/apps/v1/namespaces/${item.namespace}/deployments/${item.name}/scale`;
                arr.push(new Promise((resolve, reject) => {
                    k8sClient.put(path, payload).then(res => {
                        if (res.statusCode !== 200) {
                            logger.warn(res.statusCode, res.body);
                        } else {
                            logger.info(item.namespace, item.name, 'Scaled Down');
                        }
                        resolve(res);
                    }).catch(err => {
                        logger.error(err);
                        reject(err);
                    });
                }));
            });
            return Promise.all(arr).then(docs => {
                resolve(docs);
            }).catch(err => {
                reject(err);
            });
        }).catch(err => {
            reject(err);
        });
    });
};

/**
 * @param {string} release
 */
e.scaleUp = (release) => {
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
                "replicas": 1
            }
        };
        const path = `/apis/apps/v1/namespaces/${namespace}/deployments/${name}/scale`;
        arr.push(new Promise((resolve, reject) => {
            k8sClient.put(path, payload).then(res => {
                if (res.statusCode !== 200) {
                    logger.warn(res.statusCode, res.body);
                } else {
                    logger.info(namespace, name, 'Scaled Up');
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

e.query = (path) => {
    return new Promise((resolve, reject) => {
        k8sClient.get(path).then(res => {
            if (res.statusCode !== 200) {
                logger.warn(res.statusCode, res.body);
            }
            resolve(res);
        }).catch(err => {
            logger.error(err);
            reject(err);
        });
    });
};

module.exports = e;