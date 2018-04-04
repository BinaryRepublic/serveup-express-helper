'use strict';

const APIController = require('./APIController');
const RealmAccountController = require('../../ro-realm/controller/RealmAccountController');

const AuthApiInterface = require('../library/AuthApiInterface');
const Logger = require('../library/Logger');

const uuidv4 = require('uuid/v4');

class AuthController extends APIController {
    constructor () {
        super();
        this.realmAccount = new RealmAccountController();
        this.authApi = new AuthApiInterface();
        this.logger = new Logger();

        this.login = this.login.bind(this);
        this.logout = this.logout.bind(this);
    };

    login (req, res) {
        let reqValid = this.requestValidator.validRequestData(req.body, [{
            name: 'mail',
            type: 'string',
            nvalues: ['']
        },
        {
            name: 'password',
            type: 'string',
            nvalues: ['']
        }]);
        this.handleRequest(reqValid, () => {
            let accountId;
            // check if root login
            if (req.body.mail === process.env.ROOT_USERNAME && req.body.password === process.env.ROOT_PASSWORD) {
                accountId = 'root';
            } else {
                // user login
                let account = this.realmAccount.objectsWithFilter('Account', 'mail == "' + req.body.mail + '" && password == "' + req.body.password + '"');
                account = this.realmAccount.formatRealmObj(account)[0];
                if (account) {
                    accountId = account.id;
                }
            }
            if (accountId) {
                let newGrant = uuidv4();
                this.authApi.grant(newGrant, accountId).then(result => {
                    // authentication successful
                    this.logger.log(200, req.method, req.path, undefined);
                }).catch(err => {
                    this.logger.error(500, req.method, req.path, {
                        type: 'INTERNAL_SERVER_ERROR',
                        msg: err
                    });
                });
                return {
                    accountId: accountId,
                    grant: newGrant
                };
            }
        }, res, req);
    }
    logout (req, res) {
        let reqValid = this.requestValidator.validRequestData(req.body, [{
            name: 'accessToken',
            type: 'string',
            nvalues: ['']
        }]);
        this.handleRequest(reqValid, () => {
            let accessToken = req.body.accessToken;
            this.authApi.logout(accessToken).then(result => {
                this.logger.log(200, req.method, req.path, undefined);
            }).catch(err => {
                this.logger.error(500, req.method, req.path, {
                    type: 'INTERNAL_SERVER_ERROR',
                    msg: err
                });
            });
            return {
                accessToken: accessToken
            };
        }, res, req);
    }
}
module.exports = AuthController;
