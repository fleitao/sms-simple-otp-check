# sms-simple-otp-check
Simple SMS based One-Time-Password (OTP) Application check

Author: 
Filipe Leitão (contact@fleitao.org)

# Description:
This is a very simple SMS based security application using a One-Time-Password (OTP) generated for 
Two-Factor-Authentication (2FA) enforcement. It includes a Web-Front-End that receives the mobile
number to validate, a javascript backend that generates the token and another Web-Front-End to 
validate the token received.

# Usage:
1) Edit all the html files and replace paths to other html files and js script;
2) Edit otp-sms.js and replace html path and Restcomm API credential details;
3) Open rc-otp-sms-index.html location and start the flow from there.

# Flow:
1) rc-otp-sms-index.html collects the number to validate and sends it to otp-sms.js;
2) otp-sms.js collects the number, generates a token (OTP) and stores the details in tokens.json;
3) otp-sms.js sends the token (OTP) over SMS to the number collected and redirects the user to rc-otp-sms-token.html;
4) rc-otp-sms-token.html collects the token inserted by the user and sends it to otp-sms.js for validation;
5) otp-sms.js checks token in tokens.json and if valid redirects user to rc-otp-sms-token-ok.html otherwise redirects
   the user to rc-otp-sms-token-nok.html

# Service Architecture:
The service is split into six components: 
- rc-otp-sms-index.html / simple HTML front-end that triggers otp-sms.js script to generate token;
- rc-otp-sms-token.html / simple HTML front-end that triggers otp-sms.js script to validate token;
- rc-otp-sms-token-ok.html / simple HTML front-end that indicates token was valid;
- rc-otp-sms-token-nok.html / simple HTML front-end that indicates token was notvalid;
- otp-sms.js / simple node.js middleware that generates/validates token and uses Restcomm to send it over SMS;
- tokens.json / siple json file that persists temporarily token and numberinformation.


Please note that to execute this application you'll need a Restcomm account.
You can get a free Restcomm account using the following link: https://cloud.restcomm.com/#/signup
