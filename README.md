# googleauth-micro


## Installation

```sh
npm install --save googleauth-micro
```

## Usage

app.js
```js
const { send } = require('micro');
const microAuthGoogle = require('googleauth-micro');

const options = {
  clientId: 'CLIENT_ID',
  clientSecret: 'CLIENT_SECRET',
  callbackUrl: 'http://localhost:3000/oauthCallback',
  path: '/auth/Gplus',
  scope: 'https://www.googleapis.com/auth/plus.me',
  access_type:'offline'
};

const googleAuth = microAuthGoogle(options);

// third `auth` argument will provide error or result of authentication
// so it will { err: errorObject } or { result: {
//  provider: 'google',
//  accessToken: 'blahblah',
//  info: userInfo
// }}
module.exports = googleAuth(async (req, res, auth) => {

  if (!auth) {
    return send(res, 404, 'Not Found');
  }

  if (auth.err) {
    // Error handler
    return send(res, 403, 'Forbidden');
  }

  return `Hello ${auth.result.info.name}`;

});

```

Run:
```sh
micro app.js
```

Now visit `http://localhost:3000/auth/Gplus`

