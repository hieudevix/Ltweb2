const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const passport = require('./middlewares/passport');
const db = require('./services/db');

//Session
app.use(cookieSession({
    name: 'session',
    keys: ['ltweb2-2020'],
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

app.use(express.static('publics'));
app.set('views', './views');
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.urlencoded());

// Middlewares
app.use(passport.initialize());
app.use(passport.session());
app.use(require('./middlewares/auth'));

// Routes
app.get('/', require('./routes/index'));
app.use('/admincp', require('./routes/admincp'));
app.use('/admincp/customers/pendingRequests', require('./routes/admincp_cus_pending_req'));
app.use('/admincp/customers/view', require('./routes/admincp_cus_view'));
app.use('/admincp/customers/trans', require('./routes/admincp_cus_trans'));
app.use('/admincp/customers/findAll', require('./routes/admincp_cus_findAll'));
app.use('/register', require('./routes/register'));
app.use('/login', require('./routes/login'));
app.use('/logout', require('./routes/logout'));
app.use('/salaib', require('./routes/salaib'));
app.use('/resetpassword', require('./routes/resetpassword'));

app.use(function (req, res) {
    res.status(404).render('404 Erorr!!');
});

db.sync()
    .then(() => {
        app.listen(port, () => console.log(`Server is listening on port ${port}!`));
    })
    .catch(err => console.error(err));