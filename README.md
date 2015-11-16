This is a simple proof of concept that shows how to use [Passport][passport] and its standard [OAuth2][passport-oauth2]
strategy to provide OAuth/SSO integration with CloudFoundry's [UAA][uaa].  This is just a simple demonstration
application so the [Express][express] server is in one file and the [Polymer][polymer] UI is just thrown together.

### Running

To run this, just copy `oauth-config-sample.json` to `oauth-config.json`, update it to have your pertinent details and
run via `node .`.

**Note:**  I am aware of the [passport-cloudfoundry][passport-cloudfoundry] Passport strategy but it's broken and I was
able to use the built-in extensibility to do this without a specialized strategy.

[express]: http://expressjs.com/
[passport]: http://passportjs.org/
[passport-cloudfoundry]: https://github.com/rajaraodv/passport-cloudfoundry
[passport-oauth2]: https://github.com/jaredhanson/passport-oauth2
[polymer]: https://www.polymer-project.org
[uaa]: https://github.com/cloudfoundry/uaa
