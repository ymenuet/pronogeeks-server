require('dotenv').config();

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const express = require('express');
const favicon = require('serve-favicon');
const hbs = require('hbs');
const mongoose = require('mongoose');
const logger = require('morgan');
const path = require('path');

const session = require("express-session");
const MongoStore = require('connect-mongo')(session);
const flash = require("connect-flash");
const cors = require('cors')


mongoose
    .connect(process.env.DB, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true
    })
    .then(x => {
        console.log(`Connected to Mongo! Database name: "${x.connections[0].name}"`)
    })
    .catch(err => {
        console.error('Error connecting to mongo', err)
    });

const app = express();

// Middleware Setup
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(cookieParser());
app.use(cors({
    origin: ['http://localhost:3001']
}))

// Express View engine setup

app.use(require('node-sass-middleware')({
    src: path.join(__dirname, 'public'),
    dest: path.join(__dirname, 'public'),
    sourceMap: true
}));


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.ico')));


hbs.registerHelper('ifUndefined', (value, options) => {
    if (arguments.length < 2)
        throw new Error("Handlebars Helper ifUndefined needs 1 parameter");
    if (typeof value !== undefined) {
        return options.inverse(this);
    } else {
        return options.fn(this);
    }
});


// default value for title local
app.locals.title = 'Express - Generated with IronGenerator';


// Enable authentication using session + passport
app.use(session({
    secret: process.env.SECRET,
    resave: true,
    saveUninitialized: true,
    store: new MongoStore({
        mongooseConnection: mongoose.connection
    })
}))
app.use(flash());
require('./passport')(app);


app.use('/', require('./routes/index'));
app.use('/auth', require('./routes/auth'));
app.use('/season', require('./routes/season'))
    // app.use('/matchweek', require('./routes/matchweek'))
    // app.use('/geekleague', require('./routes/geekLeague'))
    // app.use('/team', require('./routes/team'))
    // app.use('/fixture', require('./routes/fixture'))
    // app.use('/pronogeek', require('./routes/pronogeek'))


module.exports = app;