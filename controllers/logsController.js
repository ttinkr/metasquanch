const logsService = require('../services/logsService');

const getLogs = async (req, res) => {
    try {
        const logs = await logsService.getLogs(req.session.id);
        res.json(logs);
    } catch (err) {
        res.status(404).send();
    }
}

module.exports = {
    getLogs
};