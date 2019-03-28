
// ================================ Two-Factor-Authentication ================================

// Description:
// This simple app exposes two API instructions that enable OTP (One Time Password). One
// command receives the mobile number indicated in the web and generates the token; while the 
// other command will check the validity of the token added.

// Author: 
// Filipe Leitão (contact@fleitao.org)

// Application:
const appName = "otp";

// ============================================================================================


var express = require('express');
var fs = require("fs");
var request = require('request');
var crypto = require('crypto');


// =============== Restcomm Account Details =============== 

  var rc_server         = "<<my_organisation>>.restcomm.com";
  var rc_restCommBase   = "restcomm";
  var rc_accountBase    = "2012-04-24/Accounts";
  var rc_accountSid     = "<<your_restcomm_account_sid>>";
  var rc_accountToken   = "<<your_restcomm_account_token>>";
  var rc_application    = "SMS/Messages";
  
  var rc_path =  rc_restCommBase + '/' 
                + rc_accountBase + '/'  
                + rc_accountSid + '/' 
                + rc_application;

const serviceName       = "OTPApp"


// =============== RESTful API Creation =============== 

var rest = express();

// =============== RANDOM Token Code =============== 

//function code taken from http://blog.tompawlak.org/how-to-generate-random-values-nodejs-javascript
function randomValueHex (len) {
    return crypto.randomBytes(Math.ceil(len/2))
        .toString('hex') // convert to hexadecimal format
        .slice(0,len).toUpperCase();   // return required number of characters
}


// =============== RESTful POST API ADD NUMBER GENERATE TOKEN  =============== 


// POST - Receive Number: https://<<my_api_url>>/otp/gettoken?number=123456789

// RETURNS:
//  - 0: Not Authorised
//  - 1: Message Broadcasted

rest.get('/'+appName+'/gettoken', function (req, res) {
    

    // get timestamp
    var now = new Date();
    var timestamp = 'utc|' + now.getUTCFullYear() 
                           + '/' + (now.getUTCMonth()+1)
                           + '/' + now.getUTCDate()
                           + '|' + now.getHours()
                           + ':' + now.getMinutes();


   // Read Tokens File
   fs.readFile( "<<path>>/tokens.json", 'utf8', function (err, data) {
       if (err) {
            return console.error(err.message);
         }
    
        var obj = {
           tokens: []
        };
        

        obj = JSON.parse(data); //conver it to an object

        //define SMS origin number (to add)
        var mobilenumber = req.query.number;


        // generate random token
        var token = randomValueHex(6);

            
        // add token and number to the list
        obj[token] = {number:mobilenumber,last_updated:timestamp,token:token};

        var json = JSON.stringify(obj); //convert it back to json

       fs.writeFile("<<path>>/tokens.json", json, 'utf8', function (err, data) {
            if (err) {
                return console.error(err.message);
             }
            
            console.log("[%s] SERVER - token requested | [%s]:[%s] ",timestamp,mobilenumber,token);
            
            //res.end('1');
            res.writeHead(302, {
                'Location': 'https://<<my_web_front_end>>/rc-otp-sms-token.html'
            });
            
            res.end();
        });
        
        // finally sends SMS with token
        
        var options = {
                        url: 'https://' + rc_server + '/' + rc_path,
                        auth: {
                            username: rc_accountSid,
                            password: rc_accountToken
                        },
                        form: {
                            To: mobilenumber,
                            From: serviceName,    // I want the origin to be a string
                            Body: 'Your OTPApp token is: ' + token
                        } 
                    };
                    
                    request.post(options,function(err,resp,body){
                        if (err) { return console.log(err); }
                            // console.log("[%s] DEBUG - Message Sent - Report Received:",timestamp);
                            // console.log(body);
                    });                    
            
    })
})


// =============== RESTful POST API CHECK TOKEN  =============== 


// POST - Check Token: https://<<my_api_url>>/otp/checktoken?token=SDEODJ

// RETURNS:
//  - 0: Not Authorised
//  - 1: Message Broadcasted

rest.get('/'+appName+'/checktoken', function (req, res) {
    

    // get timestamp
    var now = new Date();
    var timestamp = 'utc|' + now.getUTCFullYear() 
                           + '/' + (now.getUTCMonth()+1)
                           + '/' + now.getUTCDate()
                           + '|' + now.getHours()
                           + ':' + now.getMinutes();


   // Read Tokens File
   fs.readFile( "<<path>>/tokens.json", 'utf8', function (err, data) {
       if (err) {
            return console.error(err.message);
         }
    
        var obj = {
           tokens: []
        };
        
        //get token (to add)
        var token = req.query.token;

        obj = JSON.parse(data); //conver it to an object

        // token is valid - yes
        if(obj.hasOwnProperty(token)){
            
                console.log("[%s] SERVER - valid token received: [%s]",timestamp,token);

                //obj[token] = {last_checked:timestamp,token:token};
            
                // delete token from db
                delete obj[token];

                var json = JSON.stringify(obj); //convert it back to json
    
                fs.writeFile("<<path>>/tokens.json", json, 'utf8', function (err, data) {
                if (err) {
                    return console.error(err.message);
                }
            
                //res.end('1'); //need to redirect to YES page
                
                res.writeHead(302, {
                    'Location': 'https://<<my_web_front_end>>/rc-otp-sms-token-ok.html'
                });
            
                res.end();

            });
        } 
        
        // token is NOT valid - no
        else {
                
                console.log("[%s] SERVER - invalid token received: [%s]",timestamp,token);
        
                //res.end('0'); //need to redirect to try again page
                
                res.writeHead(302, {
                    'Location': 'https://<<my_web_front_end>>/rc-otp-sms-token-nok.html'
                });
                
                res.end();
                
            }            
    })
})


// =============== RESTful Server Start =============== 

var server = rest.listen(8081, function () {

  var host = server.address().address
  var port = server.address().port

  console.log("[LOG] SERVER - "+appName+" app listening at http://%s:%s", host, port)

})
