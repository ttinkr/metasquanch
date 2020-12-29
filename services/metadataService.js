const
    fs = require("fs-extra"),
    path = require('path'),
    {
        execFileSync
    } = require('child_process'),
    logsService = require('../services/logsService');

const execExiftoolShow = async sessionId => {
    await logsService.enableLogs(sessionId);
    const absolutePath = path.join(process.env.UPLOAD_PATH, sessionId);
    try {
        execFileSync('exiftool', ['-j', '-G', `${absolutePath}`]);
        console.log(stdout || stderr);
    } 
    catch (err){
    }
}

const execExiftoolRemove = async sessionId => {
    const absolutePath = path.join(process.env.UPLOAD_PATH, sessionId);
    try {
        execFileSync('exiftool', ['-all=', `${absolutePath}`]);
    } 
    catch (err) {
    }
}

const execQpdfLinearize = async sessionId => {
    const absolutePath = path.join(process.env.UPLOAD_PATH, sessionId);
    fs.readdirSync(absolutePath).forEach(file => {
        const absoluteFilePath = path.join(absolutePath, file);
        try {
            execFileSync('qpdf', ['--no-warn', '--warning-exit-0', '--linearize', '--replace-input', `${absoluteFilePath}`]);
            
        } 
        catch (err) {
        }
    })
}

module.exports = {
    execExiftoolShow,
    execExiftoolRemove,
    execQpdfLinearize
};
