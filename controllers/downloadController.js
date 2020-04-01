const
    fs = require("fs-extra"),
    path = require('path'),
    fsp = require('fs').promises,
    fileService = require('../services/fileService');

const downloadFiles = async (req, res) => {
    const zipFilename = path.join(process.env.DOWNLOAD_PATH, req.session.id, 'cleanFiles_' + req.session.id + '.zip');
    const uploadPath = path.join(process.env.UPLOAD_PATH, req.session.id);
    const downloadPath = path.join(process.env.DOWNLOAD_PATH, req.session.id);
    try {
        await fsp.access(zipFilename);
        res.download(zipFilename, async function () {
            await emptyDir(uploadPath);
            await fs.emptyDir(downloadPath);
            req.session.regenerate(function (err) {});
        });
    } catch (err) {
        const singleFilename = path.join(process.env.DOWNLOAD_PATH, req.session.id, req.session.filename);
        res.download(singleFilename, async function () {
            await fs.emptyDir(uploadPath);
            await fs.emptyDir(downloadPath);
            req.session.regenerate(function (err) {});
        });
    }
}

module.exports = {
    downloadFiles
};