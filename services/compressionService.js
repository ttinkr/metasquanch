const
    AdmZip = require('adm-zip'),
    path = require('path'),
    fs = require('fs');

const compressFiles = async (files, req) => {
    const zip = new AdmZip();
    const zipFileName = path.join(__dirname, "../", process.env.DOWNLOAD_PATH, req.session.id, 'cleanFiles_' + req.session.id + '.zip');
    try {
        // If download bundle was already generated, but not downloaded, include last uploaded files also in new .zip file
        if (fs.existsSync(zipFileName)) {
            const uploadPath = path.join(process.env.UPLOAD_PATH, req.session.id);
            fs.readdir(uploadPath, function (err, oldFiles) {
                if (err) {
                    return console.log('Unable to scan directory: ' + err);
                }
                // Add old, but not downloaded files to .zip
                oldFiles.forEach(file => {
                    console.log(file);
                    if (!file.endsWith('_original')) {
                        let absolutePath = path.join(__dirname, "../", process.env.UPLOAD_PATH, req.session.id, file);
                        zip.addLocalFile(absolutePath);
                    }
                });
                // Now add new files also to .zip
                files.forEach(file => {
                    let absolutePath = path.join(__dirname, "../", process.env.UPLOAD_PATH, req.session.id, file.name);
                    zip.addLocalFile(absolutePath);
                });
                zip.writeZip(zipFileName);
                req.session.filename = zipFileName;
            });
            // If single file was uploaded before and has to be added to the .zip
        } else if (req.session.filename != undefined && req.session.ultype == 'single') {
            const singleFilename = path.join(__dirname, "../", process.env.UPLOAD_PATH, req.session.id, req.session.filename);
            let absolutePath = singleFilename;
            zip.addLocalFile(absolutePath);
            // Now add new files also to .zip
            files.forEach(file => {
                let absolutePath = path.join(__dirname, "../", process.env.UPLOAD_PATH, req.session.id, file.name);
                zip.addLocalFile(absolutePath);
            });
            zip.writeZip(zipFileName);
            req.session.filename = zipFileName;
        } else {
            // Add files to .zip
            files.forEach(file => {
                let absolutePath = path.join(__dirname, "../", process.env.UPLOAD_PATH, req.session.id, file.name);
                zip.addLocalFile(absolutePath);
            });
            zip.writeZip(zipFileName);
            req.session.filename = zipFileName;
        }
    } catch (err) {
        console.error(err);
    }
}

module.exports = {
    compressFiles
};