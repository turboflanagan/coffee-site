var express = require('express');
var passport = require('passport');
//Require our account.js file which resides in models one dir up
var Account = require('../models/account');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
    //res.send(req.session);
    res.render('index', { username : req.session.username });
    console.log(username);
    console.log("==============================username=========================");


});

////////////////////////////////////////
////////////////REGISTER////////////////
////////////////////////////////////////

// Get the register page
router.get('/register', function (req, res) {
    res.render('register', { });
});

//Post to the register page
router.post('/register', function (req, res) {
    //The mongo statement to insert the new vars into the db
    Account.register(new Account(
            { username : req.body.username }
        ),
        req.body.password, 
        function(err, account) {
            if (err) {
                return res.render('register', { err : err });
            }  //the return above removes the need for an else statement because it will
               // exit the function.  Without return above, an else statement would be needed.
        passport.authenticate('local')(req, res, function () {
        	console.log('=========user object========')
        	console.log(req.user);
        	console.log('===================')
            req.session.username = req.body.username;
            res.render('choices', { username : req.session.username });
        });
    });
});

/* ---------------------------- */
/* ----------Login----------- */
/* ---------------------------- */
//Get the login page
router.get('/login', function (req, res, next) {

    //the user is already logged in
    if(req.session.username){
        res.redirect('/index');
    }
    //req.query.login pulls the query parameters right out of the http headers!
    //They are here and failed a login
    if (req.query.failedlogin){
        res.render('login', { failed : "Your username or password is incorrect." });    
    }
    //They are here and aren't logged in
<<<<<<< HEAD
    // res.render('login', { });
})

router.post('/login', function(req, res, next) {

=======
    res.render('login', { });
})

router.post('/login', function(req, res, next) {
>>>>>>> master

      passport.authenticate('local', function(err, user, info) {
        if (err) {
          return next(err); // will generate a 500 error
        }
        // Generate a JSON response reflecting authentication status
        if (! user) {
          return res.redirect('/login?failedlogin=1');
        }
        if (user){
            // Passport session setup.
            passport.serializeUser(function(user, done) {
              console.log("serializing " + user.username);
              done(null, user);
            });

            passport.deserializeUser(function(obj, done) {
              console.log("deserializing " + obj);
              done(null, obj);
            });        
            req.session.username = user.username;
        }

        return res.redirect('/');
      })(req, res, next);
});

/* ---------------------------- */
/* ----------Logout----------- */
/* ---------------------------- */
router.get('/logout', function(req, res) {
    req.logout();
    req.session.destroy();
    res.redirect('/');
});

/* ---------------------------- */
/* ---------CHOICES GET--------- */
/* ---------------------------- */

router.get('/choices', function (req, res, next){
    // Make sure the user is logged in!
    if(req.session.username){
        //They do belong here. Proceed with the page.
        // Check to see if they have prefs set already.
        Account.findOne(
            { username: req.session.username }
        ), function (err, doc){ var currGrind = doc.grind ? doc.grind : undefined }

        // Render the choices view
        res.render('choices', { username: req.session.username });
    }else{
        res.redirect('/');
    }
});

router.post('/choices', function (req, res, next){
    if(req.session.username){
    // Make sure the user is logged in!      
    var newGrind = req.body.grind;
    var newPounds = req.body.quarterpounds;
    var newFrequency = req.body.frequency;

    var query = {username: req.session.username};
    // var update = 
        Account.findOneAndUpdate(
            { username: req.session.username },
            { grind: newGrind },
            { upsert: true },
            function (err, account){
                if (err){
                    res.send('There was an error saving your preferences.  Please re-enter or send this error to our help team: ' + err)
                }else{
                    console.log("=================================================")
                    console.log(account)
                    console.log("=================================================")
                    account.save;
                }
            }
        )

        Account.findOneAndUpdate(
            { username: req.session.username },
            { frequency: newFrequency },
            { upsert: true },
            function (err, account){
                if (err){
                    res.send('There was an error saving your preferences.  Please re-enter or send this error to our help team: ' + err)
                }else{
                    console.log("=================================================")
                    console.log(account)
                    console.log("=================================================")
                    account.save;
                }
            }
        )

        Account.findOneAndUpdate(
            { username: req.session.username },
            { pounds: newPounds },
            { upsert: true },
            function (err, account){
                if (err){
                    res.send('There was an error saving your preferences.  Please re-enter or send this error to our help team: ' + err)
                }else{
                    console.log("=================================================")
                    console.log(account)
                    console.log("=================================================")
                    account.save;
                }
            }
        )
        res.send('choices submitted');
    }
});
    

router.get('/delivery', function (req, res, next) {
    res.render('delivery', { username: req.session.username });
});

module.exports = router;



























