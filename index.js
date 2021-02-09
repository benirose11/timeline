// if in dev mode, take contents of .env and make them available in .process
if(process.env.NODE_ENV !== "production") {
    require('dotenv').config();}

//Express is the Node.js framework that we are using
const express = require('express');
//Mongoose "elegant mongodb object modeling for node.js"
const mongoose = require('mongoose');
const app = express();
//The path module provides utilities for working with file and directory paths.
const path = require('path');
const methodOverride = require('method-override')
const flash = require('connect-flash');
const session = require('express-session');
const User = require('./models/user');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const multer  = require('multer');
const {storage} = require('./cloudinary')
const upload = multer({storage});
const action = require('./actionroutes/actions')
const render = require('./renderroutes/renders')
const mongoSanitize = require('express-mongo-sanitize');
const ejsMate = require('ejs-mate');
const helmet = require('helmet')
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/timeline';
const ExpressError = require('./utilities/expresserror');
const MongoDBStore = require('connect-mongo') (session);



app.use(express.static('public'))
app.use(express.urlencoded({extended: true}));
app.engine('ejs', ejsMate)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(methodOverride('_method'))
app.use(mongoSanitize());
app.use(helmet({contentSecurityPolicy:false}))

// our function to check that a user is logged in
const {isLoggedIn} = require('./utilities/middleware')


mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,

});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log(`Database connection open using ${dbUrl}`);
});

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// these are our session configurations to be used with app.use(session()). This all related to using cookies to remeber session information
const secret = process.env.SECRET || 'thisshouldbeabettersecret'
const store = new MongoDBStore({
    url: dbUrl,
    secret: secret,
    touchAfter: 24*60*60
})

store.on("error", function(e) {
    console.log('session store error', e)
})


const sessionConfig = {
    store: store,
    name: 'tlcookie',
    secret: secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        secure: true,
        expires: Date.now() + 1000 * 60 * 60 *24 * 7,
        maxAge: 1000 * 60 * 60 *24 * 7,}}

//sesssion gives sends a cookie so we can have a session object to modify. flash lets  enables us to flash messages
app.use(session(sessionConfig));
app.use(flash());

//we can have multiple passport.use for multiple strategies
passport.use(new LocalStrategy(User.authenticate()));

// these are required to setup passport functionality

app.use(passport.initialize());
app.use(passport.session());

//these methods have been given to use by requiring passport-local-mongoose. They tell passport how we are going to start and end the session
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// middleware to add information to the res.locals so they are available all over the app and the information doesent have to be manually passed to the route each time.
app.use((req, res, next) =>{
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error')
    next()
})

// PAGE VIEW ROUTES

// route for home  
app.get('/timeline', render.splashpage)

app.get('/home', isLoggedIn, render.home)

app.get('/signup', render.signup)

app.get('/login', render.login)

app.get('/newentry', isLoggedIn, render.newentry)

app.get('/settings', isLoggedIn, render.settings)

app.get('/entry/new/:id', isLoggedIn, render.specdatenewentry)

app.get('/entry/edit/:id', isLoggedIn, render.edit)


// // ACTION ROUTES



app.post('/register', action.register)

app.post('/login', passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}), action.login)

app.get('/logout', action.logout)

app.put('/entry/edit/:id', upload.array('image'), isLoggedIn, action.edit)

app.get('/entry/delete/:id', isLoggedIn, action.deleteEntry)

app.post('/date/delete/:id', isLoggedIn, action.deleteDate)

app.post('/addtotimeline', isLoggedIn, upload.array('image'), action.new)

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!'
    res.status(statusCode).render('error', { err })
})

// opens a port for incoming data and confirms port is open in the console. 
const port = process.env.PORT || 3000

app.listen(port, () => {
    console.log(`Serving timeline on port ${port}`)
})


// database management functions

// const managedb = require('./seeds/index')

// managedb.clearDB()
// managedb.seedDB()




