var Promise = require('promise');
var http = require('http');
var request = require('request');

module.exports.login42 = function(data) {
    return  new Promise(function(fullfil, reject) {
        request.post({
            url: 'https://api.intra.42.fr/oauth/token',
            json: true,
            body: {
                grant_type: 'authorization_code',
                client_id: '8d0a917b0c36460e736b1435ed9e4dddfb107f23b759f4cabb21988bd7e97625',
                client_secret: '995d64bba882d8fb8d0ad4ac33134db9e5edbb0655a27803e33237267a98a640',
                code: data.args.Ocode,
                redirect_uri: 'http://46.101.7.5/templates/Oauth42.html'
            }
        }, function (error, response, body){
            if (error)
                reject({'res': data.res, state:'validation', error: 'Your 42 token is invalid.'});
            else {
                if (response.body.error)
                    reject({'res': data.res, state:'validation', error: response.body.error_description});
                data.Otoken = response.body.access_token;
                fullfil(data);
            }
        });
    });
};
module.exports.retrieve42 = function(data) {
    return  new Promise(function(fullfil, reject) {
        request.get({
            url: 'https://api.intra.42.fr/v2/me?access_token='+data.Otoken,
            json: true
        }, function (error, response, body){
            if (error)
                reject({'res': data.res, state:'validation', error: '42 api does not work.'});
            else {
                if (response.body.error)
                    reject({'res': data.res, state:'validation', error: response.body.error_description});
                data.Ouser = {
                    pseudo: "42-"+response.body.login,
                    email: response.body.email,
                    firstname: response.body.firstname,
                    lastname: response.body.lastname,
                    image: response.body.image_url,
                    lang: "en"
                };
                fullfil(data);
            }
        });
    })
};

module.exports.loginGithub = function(data) {
    return  new Promise(function(fullfil, reject) {

        request.post({
            url: 'https://github.com/login/oauth/access_token',
            json: true,
            body: {
                client_id: '097eaccd8d61de601a98',
                client_secret: 'd89a1e79ce724dcaadc2494f22583b940a533896',
                code: data.args.Ocode
            }
        }, function (error, response, body){
            if (error)
                reject({'res': data.res, state:'validation', error: 'Your Github token is invalid.'});
            else {
                if (response.body.error)
                    reject({'res': data.res, state:'validation', error: response.body.error_description});
                data.Otoken = response.body.access_token;
                fullfil(data);
            }
        });
    })
};
module.exports.retrieveGithub = function(data) {
    return  new Promise(function(fullfil, reject) {

        request.get({
            url: 'https://api.github.com/user?access_token='+data.Otoken,
            json: true,
            headers:{
                'User-Agent': 'Neilyroth'
            }
        }, function (error, response, body){
            if (error)
                reject({'res': data.res, state:'validation', error: 'Github api does not work.'});
            else {
                if (response.body.error)
                    reject({'res': data.res, state:'validation', error: response.body.error_description});
                data.Ouser = {
                    pseudo: "Git-"+response.body.login,
                    image: response.body.avatar_url,
                    email: '',
                    firstname: '',
                    lastname: '',
                    lang: "en"
                };
                fullfil(data);
            }
        });
    })
};

module.exports.loginfb = function(data) {
    return  new Promise(function(fullfil, reject) {

        request.post({
            url: 'https://graph.facebook.com/oauth/access_token',
            json: true,
            body: {
                client_id: '520197931437825',
                client_secret: '9c17800f910852b845102450c070674f',
                code: data.args.Ocode,
                redirect_uri: 'http://46.101.7.5/templates/Oauthfb.html'
            }
        }, function (error, response, body){
            if (error)
                reject({'res': data.res, state:'validation', error: 'Your facebook token is invalid.'});
            else {
                if (response.body.error)
                    reject({'res': data.res, state:'validation', error: response.body.error.message});
                data.Otoken = response.body.access_token;
                fullfil(data);
            }
        });
    })
};
module.exports.retrievefb = function(data) {
    return  new Promise(function(fullfil, reject) {

        request.get({
            url: 'https://graph.facebook.com/me?access_token='+data.Otoken+'&fields=picture.type(large),name,last_name,first_name,email,id',
            json: true,
            headers:{
                'User-Agent': 'Neilyroth'
            }
        }, function (error, response, body){
            if (error)
                reject({'res': data.res, state:'validation', error: 'Facebook api does not work.'});
            else {
                if (response.body.error)
                    reject({'res': data.res, state:'validation', error: response.body.error.message});
                data.Ouser = {
                    pseudo: "Fb-"+response.body.id,
                    image: response.body.picture.data.url,
                    email: response.body.email,
                    firstname: response.body.first_name,
                    lastname: response.body.last_name,
                    lang: "en"
                };
                fullfil(data);
            }
        });
    })
};

module.exports.OExistsOrCreate = function(data) {
    return  new Promise(function(fullfil, reject) {
        mongodb.collection('users').findOne({pseudo: data.Ouser.pseudo}, function (err, result) {
            if (err)
                reject({'res': data.res, state:'error', error: 'Db error.'});
            else {
                if (result) {
                    data.args = data.Ouser;
                    fullfil(data);
                }
                else {
                    console.log("New Oauth user joined");
                    data.Ouser.histo = [];
                    mongodb.collection('users').insertOne(data.Ouser, function (err) {
                        if (!err) {
                            data.args = data.Ouser;
                            fullfil(data);
                        }
                        else
                            reject({'res': data.res, state:'error', error: err});
                    });

                }
            }
        });
    })
};