const AuthApiInterface = require('../library/AuthApiInterface');
const Logger = require('../library/Logger');
let logger = new Logger();

module.exports = (req, res, next) => {
    // disable authentication for unit tests
    if (req.get('Access-Token') === 'unittest' && req.hostname === '127.0.0.1') {
        // disable authorization for unit tests
        req.accountId = 'root';
        next();
    } else {
        let authApi = new AuthApiInterface();
        let accessToken = req.header('Access-Token');
        if (!accessToken) {
            let errorObj = {
                type: 'ACCESS_TOKEN_MISSING',
                msg: 'Please send a valid access-token in the request header.'
            }
            logger.error(400, req.method, req.path, errorObj);
            res.status(400).json({
                error: errorObj
            });
        } else {
            authApi.access(accessToken).then(resp => {
                req.accountId = resp.clientId;
                next();
            }).catch((err) => {
                // default error
                let error = {
                    type: 'ACCESS_TOKEN_INVALID',
                    msg: 'Please send a valid access-token in the request header.'
                };
                let body = err.response.data;
                if (body && body.error) {
                    error = body.error;
                }
                logger.error(400, req.method, req.path, error);
                res.status(401).json({
                    error: error
                });
            });
        }
    }
};
