
class Logger {
    log(responseStatusCode, requestMethod, requestPath, errorType, errorMsg) {
        let date = new Date()
        let obj = {
            responseStatusCode:responseStatusCode,
            requestMethod: requestMethod,
            requestPath: requestPath,
            errorType:errorType,
            errorMsg:errorMsg,
            logDate:date
        }
        if(process.env.TEST == undefined) {
            console.info(JSON.stringify(obj));
        }
    }
    error(responseStatusCode, requestMethod, requestPath, error) {
        var msg
        var type
        if(error) {
            if(error.type) {
                type = error.type
            }
            if(error.msg) {
                msg = error.msg
            }
        }
        this.log(responseStatusCode, requestMethod, requestPath, type, msg);
    }
}
module.exports = Logger;
