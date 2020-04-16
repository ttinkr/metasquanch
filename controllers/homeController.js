const renderHome = async (req, res) => {
    req.session.regenerate(function (err) {
        res.render('index', {
            title: 'ｍеｔａѕｑｕаｎсһ ',
            heading: 'ｍеｔａѕｑｕаｎсһ ',
            homeActive: true
        });
    });
}

module.exports = {
    renderHome
};