const querystring = require('querystring');
const url = require('url');
const uuid = require('uuid');
const rp = require('request-promise');
const redirect = require('micro-redirect');
const google = require('googleapis');
let plus = google.plus('v1');
let OAuth2 = google.auth.OAuth2;
let request = require("request");

const provider = 'google';

const microAuthGoogle = ({ access_type = 'offline',clientId, clientSecret, callbackUrl, path = '/auth/google', scope = 'https://www.googleapis.com/auth/plus.me'  }) => {
  const getRedirectUrl = () => {
    return `https://accounts.google.com/o/oauth2/auth?access_type=${access_type}&scope=${scope}&response_type=code&client_id=${clientId}&redirect_uri=${callbackUrl}`;
  };=
return fn => async (req, res, ...args) => {

  const { pathname, query } = url.parse(req.url);

  if (pathname === path) {
    try {
      const redirectUrl = getRedirectUrl();
      return redirect(res, 302, redirectUrl);
    } catch (err) {
      args.push({ err, provider });
      return fn(req, res, ...args);
    }
  }

  const callbackPath = url.parse(callbackUrl).pathname;
  if (pathname === callbackPath) {
    try {
      const { code } = querystring.parse(query);
      let response  = {
        method: 'POST',
        url: 'https://accounts.google.com/o/oauth2/token',
        headers:
           {
             'cache-control': 'no-cache',
             'content-type': 'application/x-www-form-urlencoded' },
        json: true,
        form: {
          code: code,
           client_id: clientId,
           client_secret: clientSecret,
           redirect_uri: callbackUrl,
           grant_type: 'authorization_code'
        }
        };

        const data = await rp(response);
        let access_token = data.access_token;


      if (data.error) {
        args.push({ err: data.error, provider });
        return fn(req, res, ...args);
      }

      let options2 = {
        method: 'GET',
        url: 'https://www.googleapis.com/oauth2/v1/userinfo',
        qs:
         { alt: 'json',
           access_token: access_token
         },
        headers:{'cache-control': 'no-cache' }
         };

         const user = await rp(options2);

         const result = {
           provider,
           access_token,
           info: JSON.parse(user)
         };

         args.push({ result });
         return fn(req, res, ...args);
      }catch (err) {
          args.push({ err, provider });
          return fn(req, res, ...args);
        }
      }
};
};

module.exports = microAuthGoogle;


