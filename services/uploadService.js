const multer = require("multer"),
  sanitize = require("sanitize-filename"),
  mkdirp = require("mkdirp");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = process.env.UPLOAD_PATH + "/" + req.session.id;
    mkdirp.sync(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, sanitize(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: {
    files: process.env.MAX_FILES,
    fileSize: process.env.MAX_FILESIZE * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    // allow only certain filetypes
    if (!file.originalname.toLowerCase().match(/\.(jpg|jpeg|png|gif|pdf|doc|xls|ppt|docx|xlsx|pptx)$/)) {
      return cb(new Error("Unsupported document type."), false);
    }
    cb(null, true);
  },
});

const getUploadedFiles = async (req, res) => {
  try {
    const files = req.files;
    if (!files) {
      res.status(400).send({
        status: false,
        data: "No file is selected",
      });
    } else {
      let uploadedFiles = [];
      files.map((p) =>
        uploadedFiles.push({
          name: sanitize(p.originalname),
          mimetype: p.mimetype,
          size: p.size,
        })
      );
      return uploadedFiles;
    }
  } catch (err) {
    // res.status(500).send(err);
    res.status(500).send("Something went wrong with the upload");
  }
};

module.exports = {
  upload,
  getUploadedFiles,
};