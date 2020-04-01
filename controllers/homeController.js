const renderHome = async (req, res) => {
    res.render('index', {
        title: 'metasquanch',
        heading: 'metasquanch',
        homeActive: true
    });
}

module.exports = {
    renderHome
};