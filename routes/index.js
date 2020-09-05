module.exports = function index(req, res) {
    if (req.currentUser) {
        if (req.currentUser.isStaff) {
            return res.redirect('/admincp');
        }
        return res.redirect('/salaib');
    }
    res.redirect('/login');
};