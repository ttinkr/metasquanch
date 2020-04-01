const
    fs = require('fs-extra'),
    path = require('path');

const enableLogs = async sessionId => {
    const logFile = path.join(__dirname, '../', process.env.LOG_PATH, sessionId, sessionId + '.log');
    const logPath = path.dirname(logFile);
    try {
        await fs.mkdirp(logPath);
        const stream = fs.createWriteStream(logFile);
        process.stdout.write = stream.write.bind(stream);
        return true;
    } catch (err) {
        throw new Error(err);
    }
}

const redactLogs = async log => {
    const cleanLogs = JSON.parse(log);
    for (var i in cleanLogs) {
        delete cleanLogs[i]['SourceFile'];
        delete cleanLogs[i]['File:Directory'];
        delete cleanLogs[i]['File:FilePermissions'];
    }
    return cleanLogs;
}

const getLogs = async sessionId => {
    const logFile = path.join(__dirname, '../', process.env.LOG_PATH, sessionId, sessionId + '.log');
    try {
        const log = await fs.readFile(logFile, 'utf-8');
        const cleanLogs = await redactLogs(log);
        return cleanLogs;
    } catch (err) {
        throw new Error(err);
    }
}

module.exports = {
    enableLogs,
    redactLogs,
    getLogs
};