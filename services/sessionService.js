const
    fs = require("fs-extra"),
    path = require("path");

const sessionCleanup = async sessionId => {
    const uploadPath = path.join(process.env.UPLOAD_PATH, sessionId);
    const downloadPath = path.join(process.env.DOWNLOAD_PATH, sessionId);
    await fs.remove(uploadPath);
    await fs.remove(downloadPath);
};

module.exports = {
    sessionCleanup
};