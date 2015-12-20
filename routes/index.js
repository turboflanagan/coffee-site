var express = require('express');
var passport = require('passport');
//Require our account.js file which resides in models one dir up
var Account = require('../models/account');
var router = express.Router();
var nodemailer = require('nodemailer');
var vars = require('../config/vars.json');
var stripe = require("stripe")("sk_test_qdcjW5fecCmIPkjs1RJRbNpp");

/* GET home page. */
router.get('/', function (req, res, next) {
    //res.send(req.session);
    res.render('index', { username : req.session.username, menuItem: 'welcome' });
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
        res.redirect('/');
    }
    //req.query.login pulls the query parameters right out of the http headers!
    //They are here and failed a login
    if (req.query.failedlogin){
        res.render('login', { failed : "Your username or password is incorrect." });    
    }
    //They are here and aren't logged in
    res.render('login', { });
})

router.post('/login', function(req, res, next) {
      passport.authenticate('local', function(err, user, info) {
        if (err) {
          return next(err); // will generate a 500 error
        }
        // Generate a JSON response reflecting authentication status
        if (! user) {
          return res.redirect('/login?failedlogin=1');
        }
        if (user){
            if(user.accessLevel == 5) {//level 5 =Admin
                req.session.accessLevel = "Admin";
            }
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
        // Check to see if they have prefs set already. If so, display them.
        Account.findOne({ username: req.session.username }, 
            function (err, doc){ 
                var currGrind = doc.grind ? doc.grind : undefined 
                var currPounds = doc.pounds ? doc.pounds : undefined
                var currFrequency = doc.frequency ? doc.frequency : undefined

                // console.log("************************  doc  *************************")
                // console.log(doc);
                // console.log("************************  doc  *************************")
                
                // Render the choices view
                res.render('choices', { 
                    menuItem: 'options',
                    username: req.session.username,
                    grind: currGrind,
                    pounds: currPounds,
                    frequency: currFrequency,
                    accessLevel: req.session.accessLevel
                });
                // console.log()
            });
        res.render('choices', { username: req.session.username, menuItem: 'options' });
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
    var update = {grind: newGrind, pounds: newPounds, frequency: newFrequency};
    var options = {upsert: true};

        Account.findOneAndUpdate(query, update, options, function(err, account) {
            if (err) {
                console.log('There was an error saving your preferences. Please re-enter or send this error to our help team: ' + err );
                res.send('There was an error saving your preferences. Please re-enter or send this error to our help team: ' + err )
            }else{
                account.save;
                res.redirect('/delivery');
            }
        })
    }
});
   


router.get('/delivery', function (req, res, next) {
    if(req.session.username){
        //They do belong here. Proceed with the page.
        // Check to see if they have prefs set already.
        Account.findOne(
            { username: req.session.username }
        ),
        // Render the choices view
        res.render('delivery', { username: req.session.username, menuItem: 'delivery' });
        
    }else{
        res.redirect('/');
    }
});

router.post('/delivery', function (req, res, next) {
    if(req.session.username){
    // Make sure the user is logged in!      
    var newFullName = req.body.fullName;
    var newAddress1 = req.body.address1;
    var newAddress2 = req.body.address2;
    var newCity = req.body.city;
    var newState = req.body.state;
    var newZip = req.body.zip;
    var newDate = req.body.date;

    var query = {username: req.session.username};
    var updateAddress = {
        fullName: newFullName, 
        address1: newAddress1, 
        address2: newAddress2, 
        city: newCity, 
        state: newState, 
        zip: newZip, 
        date: newDate
        };
    var options = {upsert: true};

        Account.findOneAndUpdate(query, updateAddress, options, function (err, account){
            if (err){
                res.send('There was an error saving your preferences.  Please re-enter or send this error to our help team: ' + err)
            }else{
                console.log("=================================================")
                console.log(account)
                console.log("=================================================")
                account.save;
                res.redirect('/payment');
            }
        })
    }
});


router.get('/email', function (req, res, next){
    var transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: vars.email,
            pass: vars.password
        }
    })
    var text = "This is a test email sent from my node server";
    var mailOptions = {
        from: 'Peter Flanagan <turboflanagan@gmail.com>',
        to: 'Peter Flanagan <turboflanagan@gmail.com>',
        subject: 'Test subject email',
        text: text
    }

    transporter.sendMail(mailOptions, function (error, info) {
        if(error){
            console.log(error);
            res.json({response: error});
        }else{
            console.log("message was successfully sent. Response was " + info.response);
            res.json({response: "success"});
        }
    })
});

router.get('/contact', function (req, res, next) {
    if(req.session.username){
    res.render('contact');
    }
});

router.post('/contact', function (req, res, next) {
    if(req.session.username){

    }
});

router.get('/payment', function (req, res, next) {
if(req.session.username){

    res.render('payment', { username: req.session.username, menuItem: 'payment' });
    }
});

router.post('/payment', function (req, res, next) {
    if(req.session.username){
        stripe.charges.create({
          amount: 400,
          currency: "usd",
          source: req.body.stripeToken, // obtained with Stripe.js
          description: "Charge for " + req.body.stripeEmail
        }, function(err, charge) {
          // asynchronously called
          if(err){
            res.send('You got an err.' + err)
          }else{
            res.redirect('thank-you')
          }
        });
    }
});

router.get('/thank-you', function (req, res, next){
    if(req.session.username){

        res.render('thank-you', { username: req.session.username })
    }
});

router.get('/admin', function (req, res, next) {
    if(req.session.accessLevel == "Admin"){

        Account.find({}, function (err, doc, next){
            res.json(doc);
        })

        res.render('admin', {accounts: doc});
    

    }
})



module.exports = router;


























