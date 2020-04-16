const renderHome = async (req, res) => {
    req.session.regenerate(function (err) {
        res.render('index', {
            title: 'metasquanch',
            heading: 'metasquanch',
            homeActive: true
        });
    });
}

module.exports = {
    renderHome
};