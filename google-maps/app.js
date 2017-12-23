var swal =  require('sweetalert');
var express = require("express");
var passport = require('passport');
var morgan   = require('morgan');
var cookieParser = require('cookie-parser');
var session      = require('express-session');
var bodyParser = require('body-parser');
var NodeGeocoder = require('node-geocoder');
var flash = require('connect-flash');
var mongoose = require("mongoose");
require('./config/passport')(passport);
//var configDB = require('./config/database.js');
mongoose.createConnection("mongodb://localhost:27017/Auth");
var app = express();
var port = 3000;

var options = {
  provider: 'google',
  httpAdapter: 'https',
  apiKey: 'AIzaSyCzl60CDQlBLaeelLmXTuoLWPSwiAlXwfQ',
  formatter: null
};
var geocoder = NodeGeocoder(options);
app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ secret: 'manishkakotitask' })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash());

require('./routes/routes.js')(app, passport);
mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost:27017/tests");
var nameSchema = new mongoose.Schema({
    name: String,
    latitude: Number,
    longitude: Number,
    streetName: String,
    Country: String
});
var User = mongoose.model("User", nameSchema);
app.set('view engine', 'ejs');
app.set('view engine', 'html');

app.get("/map", (req, res) => {
    res.sendFile(__dirname + "/maps-search.html");
});

app.get('/location', function(req, res){
    User.find({}, function(err, name){
    res.render('index.ejs', { "name": name});
});
});
app.post("/new", (req, res) => {
    var myData = new User(req.body);

    var data = JSON.parse(JSON.stringify(myData.name));
    geocoder.geocode(data)
    .then(function(res) {
      console.log(res);
    })
    .catch(function(err) {
      console.log(err);
    });
    myData.save()
        .then(item => {
            res.send("Name saved to database");

        })
        .catch(err => {
            res.status(400).send("Unable to save to database");
        });
});

app.listen(port, () => {
    console.log("Server listening on port " + port);
});
