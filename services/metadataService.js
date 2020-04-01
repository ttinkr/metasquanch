const
    path = require('path'),
    {
        execFile
    } = require('child_process'),
    logsService = require('../services/logsService');

const execExiftoolShow = async sessionId => {
    await logsService.enableLogs(sessionId);
    const absolutePath = path.join(__dirname, '../', process.env.UPLOAD_PATH, sessionId);
    return new Promise((resolve, reject) => {
        execFile('exiftool', ['-j', '-G', `${absolutePath}`], (err, stdout, stderr) => {
            if (err) {
                console.error(err);
                reject(err);
            }
            console.log(stdout || stderr);
            resolve(stdout ? stdout : stderr);
        });
    });
}

const execExiftoolRemove = sessionId => {
    const absolutePath = path.join(__dirname, '../', process.env.UPLOAD_PATH, sessionId);
    return new Promise((resolve, reject) => {
        execFile('exiftool', ['-all', `${absolutePath}`], (err, stdout, stderr) => {
            if (err) {
                console.warn(err);
                reject(err);
            }
            resolve(stdout ? stdout : stderr);
        });
    })
}

module.exports = {
    execExiftoolShow,
    execExiftoolRemove
};