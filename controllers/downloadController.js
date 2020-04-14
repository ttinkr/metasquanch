const
    fs = require("fs-extra"),
    path = require('path');

const downloadFiles = async (req, res) => {
    const zipFilename = path.join(process.env.DOWNLOAD_PATH, req.session.id, 'cleanFiles_' + req.session.id + '.zip');
    const uploadPath = path.join(process.env.UPLOAD_PATH, req.session.id);
    const downloadPath = path.join(process.env.DOWNLOAD_PATH, req.session.id);
    if (await fs.pathExists(zipFilename)) {
        try {
            res.download(zipFilename, async function () {
                await emptyDir(uploadPath);
                await fs.emptyDir(downloadPath);
                req.session.regenerate(function (err) {});
            });
        } catch (err) {
            throw new Error(err);
        }
    } else {
        try {
            const singleFilename = path.join(process.env.DOWNLOAD_PATH, req.session.id, req.session.filename);
            res.download(singleFilename, async function () {
                await fs.emptyDir(uploadPath);
                await fs.emptyDir(downloadPath);
                req.session.regenerate(function (err) {});
            });
        } catch (err) {
            throw new Error(err);
        }
    }
}

module.exports = {
    downloadFiles
};