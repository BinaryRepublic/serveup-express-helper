'use strict';

const ParentRealmController = require('../../ro-realm/ParentRealmController');
const RequestValidator = require('../library/RequestValidator');
const Logger = require('../library/Logger');

class APIController {
    constructor () {
        this.requestValidator = new RequestValidator();
        this.realmController = new ParentRealmController();
        this.logger = new Logger();
    };
    handleRequest (requestValidError, databaseCallback, res, req) {
        if (requestValidError === false) {
            let result = databaseCallback();
            result = this.realmController.formatRealmObj(result);
            this.handleResponse(res, result, req);
        } else {
            let badRequest = {
                error: requestValidError
            };
            this.logger.error(400, req.method, req.path, requestValidError);
            res.status(400).json(badRequest);
        }
    };
    handleResponse (res, jsonObject, req) {
        if (jsonObject) {
            if (jsonObject.error === undefined) {
                this.logger.log(200, req.method, req.path, undefined);
                res.json(jsonObject);
            } else {
                let errorObj = {
                    error: {
                        type: 'INTERNAL_SERVER_ERROR',
                        msg: jsonObject.error
                    }
                };
                this.logger.error(500, req.method, req.path, errorObj.error);
                res.status(500).json(errorObj);
            }
        } else {
            let errorObj = {
                error: {
                    type: 'SERVER_ERROR',
                    msg: ''
                }
            };
            this.logger.error(500, req.method, req.path, errorObj.error);
            res.status(500).json(errorObj);
        }
    };
}
module.exports = APIController;
