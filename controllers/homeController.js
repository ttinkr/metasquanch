const renderHome = async (req, res) => {
    req.session.regenerate(function (err) {
        res.render('index', {
            title: 'ｍеｔａѕｑｕаｎсh',
            heading: 'ｍеｔａѕｑｕаｎсh',
            homeActive: true
        });
    });
}

module.exports = {
    renderHome
};