(function(document) {
  'use strict';

  // Grab a reference to our auto-binding template
  // and give it some initial binding values
  // Learn more about auto-binding templates at http://goo.gl/Dx1u2g
  var app = document.querySelector('#app');

  function hideLoader() {
    document.querySelector('#loading').toggle();
  }

  function renderError(err, res) {
    var errorMessage = res.error ? res.error.message : err.message;
    var errorDetails = document.createElement('error-details');

    errorDetails.error = err;
    errorDetails.errorMessage = 'Unable to retrieve the user profile';
    errorDetails.res = res;

    document.querySelector('#content').appendChild(errorDetails);

    var toast = document.querySelector('#toast');

    toast.text = 'Error: ' + (res.error ? res.error.message : err.message);

    toast.show();

    hideLoader();
  }

  function renderUser(res) {
    var userCard;

    if (res.body.profile) {
      userCard = document.createElement('user-details');
    } else {
      userCard = document.createElement('anon-user-details');
    }

    userCard.profile = res.body.profile;

    document.querySelector('#content').appendChild(userCard);

    hideLoader();
  }

  function getUserDetails() {
    superagent
      .get('/me')
      .end(function (err, res) {
        if (err || res.error) {
          renderError(err, res);
        } else {
          renderUser(res);
        }
      });
  }

  // Listen for template bound event to know when bindings
  // have resolved and content has been stamped to the page
  app.addEventListener('dom-change', function() {
    console.log('Our app is ready to rock!');
  });

  // See https://github.com/Polymer/polymer/issues/1381
  window.addEventListener('WebComponentsReady', function() {
    // imports are loaded and elements have been registered
    getUserDetails();
  });

  // Main area's paper-scroll-header-panel custom condensing transformation of
  // the appName in the middle-container and the bottom title in the bottom-container.
  // The appName is moved to top and shrunk on condensing. The bottom sub title
  // is shrunk to nothing on condensing.
  addEventListener('paper-header-transform', function(e) {
    var appName = document.querySelector('#mainToolbar .app-name');
    var middleContainer = document.querySelector('#mainToolbar .middle-container');
    var bottomContainer = document.querySelector('#mainToolbar .bottom-container');
    var detail = e.detail;
    var heightDiff = detail.height - detail.condensedHeight;
    var yRatio = Math.min(1, detail.y / heightDiff);
    var maxMiddleScale = 0.50;  // appName max size when condensed. The smaller the number the smaller the condensed size.
    var scaleMiddle = Math.max(maxMiddleScale, (heightDiff - detail.y) / (heightDiff / (1-maxMiddleScale))  + maxMiddleScale);
    var scaleBottom = 1 - yRatio;

    // Move/translate middleContainer
    Polymer.Base.transform('translate3d(0,' + yRatio * 100 + '%,0)', middleContainer);

    // Scale bottomContainer and bottom sub title to nothing and back
    Polymer.Base.transform('scale(' + scaleBottom + ') translateZ(0)', bottomContainer);

    // Scale middleContainer appName
    Polymer.Base.transform('scale(' + scaleMiddle + ') translateZ(0)', appName);
  });

})(document);
