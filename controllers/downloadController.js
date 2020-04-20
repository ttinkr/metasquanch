const
    fs = require("fs-extra"),
    path = require('path');

const downloadFiles = async (req, res) => {
    const zipFilename = path.join(process.env.DOWNLOAD_PATH, req.session.id, 'cleanFiles_' + req.session.id + '.zip');
    if (await fs.pathExists(zipFilename)) {
        try {
            res.download(zipFilename, async function () {});
        } catch (err) {
            throw new Error(err);
        }
    } else {
        try {
            const singleFilename = path.join(process.env.DOWNLOAD_PATH, req.session.id, req.session.filename);
            res.download(singleFilename, async function () {});
        } catch (err) {
            throw new Error(err);
        }
    }
}

module.exports = {
    downloadFiles
};