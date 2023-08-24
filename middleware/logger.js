const { v4: uuid } = require('uuid')
const path = require('path')
const fs = require('fs')
const fsPromises = require('fs').promises
const { format } = require('date-fns')

async function logEvents(msg, fileName)
{
    const dateTime = `${format(new Date(), 'yyyy-MM-dd\tHH:mm:ss')}`
    const logItem = `${dateTime}\t${uuid()}\t${msg}\n`
    try
    {
        await fsPromises.appendFile(path.join(__dirname, '..', 'logs', fileName), logItem)
    }
    catch(e)
    {
        console.error(e)
    }
}

function logger(req, res, next)
{
    logEvents(`${req.method}\t${req.headers.origin}\t${req.url}`, 'reqLog.log')
    next()
}

module.exports = {logger, logEvents}