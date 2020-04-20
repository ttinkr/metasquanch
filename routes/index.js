const
  router = require('express').Router(),
  homeController = require('../controllers/homeController'),
  uploadService = require('../services/uploadService'),
  cleanController = require('../controllers/cleanController'),
  downloadController = require('../controllers/downloadController'),
  logsController = require('../controllers/logsController');

router.get('/', homeController.renderHome);
router.post('/clean', uploadService.upload.any('files', process.env.MAX_FILES || 20), cleanController.cleanFiles);
router.get('/download', downloadController.downloadFiles);
router.get('/logs', logsController.getLogs);

module.exports = router;