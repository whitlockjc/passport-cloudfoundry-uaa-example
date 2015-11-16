'use strict';

var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var oauthConfig = require('./oauth-config');
var passport = require('passport')
var OAuth2Strategy = require('passport-oauth').OAuth2Strategy;
var session = require('express-session');
var authSessions = {};

// Passport OAuth2 Strategy (http://passportjs.org/)
var strategy = new OAuth2Strategy({
  authorizationURL: oauthConfig.authorizationURL,
  tokenURL: oauthConfig.tokenURL,
  clientID: oauthConfig.clientID,
  clientSecret: oauthConfig.clientSecret,
  callbackURL: oauthConfig.callbackURL,
  customHeaders: {
    // This is required since UAA uses this during the OAuth handshake
    'Authorization': 'Basic ' + new Buffer(oauthConfig.clientID + ':' + oauthConfig.clientSecret).toString('base64')
  }
}, function(accessToken, refreshToken, profile, done) {
  // Treat the profile as the user object for demonstration purposes
  done(null, profile);
});

// Make sure we use the Bearer auth strategy
strategy._oauth2.setAuthMethod('Bearer');
// Make sure we set the Authorization header when retrieving the user profile
strategy._oauth2.useAuthorizationHeaderforGET(true);
// Override the userProfile function to actually retrieve your UAA user profile
strategy.userProfile = function (accessToken, done) {
  this._oauth2.get(oauthConfig.userProfileURL, accessToken, function (err, body, res) {
    if (err) {
      return done(err);
    }

    try {
      done(null, JSON.parse(body));
    } catch (e) {
      done(e);
    }
  });
};

// Wire up the Passport strategy
passport.use('provider', strategy);
// Wire up the session user serialization
passport.serializeUser(function(user, done) {
  authSessions[user.user_id] = user;

  done(null, user.user_id);
});
// Wire up the session user deserialization
passport.deserializeUser(function(id, done) {
  done(null, authSessions[id]);
});

var start = module.exports.start = function (port) {
  app.use(cookieParser());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  // Must be before "app.use(passport.session())"
  app.use(session({
    secret: 'sso-integration-poc',
    resave: true,
    saveUninitialized: true
  }));
  // Initialize Passport
  app.use(passport.initialize());
  // Initialize Passport's session feature
  app.use(passport.session());

  // OAuth endpoints
  app.get('/auth/provider', passport.authenticate('provider'));
  app.get('/auth/provider/callback', passport.authenticate('provider', {
    successRedirect: '/',
    failureRedirect: '/login'
  }));

  // Login endpoint (Redirects to the OAuth handshake initializer)
  app.get('/login', function (req, res) {
    if (req.user) {
      res.redirect('/');
    } else {
      res.redirect('/auth/provider');
    }
  });

  // Logout endpoint (UAA does not have a logout endpoint we can call programmatically from the server side.  This means
  // we would need to do a client-side redirect to actually log the user out.  Unfortunately, without being able to
  // redirect back to this application, we just live with this for now.)
  app.get('/logout', function (req, res, done) {
    if (req.user) {
      // Destroy the session
      req.session.destroy(function (err) {
        // Delete the session's state that is not handled by Passport
        delete authSessions[req.user.user_id];

        res.redirect('/');
      });
    } else {
      res.redirect('/login');
    }
  });

  // Endpoint for getting the current logged in user's details
  app.get('/me', function (req, res) {
    res.json({
      profile: req.user
    });
  });

  // Serve the web UI
  app.use(express.static('public'));

  // Start the server
  app.listen(port, function () {
    console.log('Server listening at http://localhost:%s', port);
  });
};

if (!module.parent) {
  start(3000);
}
