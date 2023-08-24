const { logEvents } = require('./logger')

function errorHandler (err, req, res, next)
{
    logEvents(`${err.name}: ${err.message}`, 'errLog.log')
    res.status(500).send(err.message)
}

module.exports = {errorHandler}