var Check = require('./model/checker.js');
var Mongo = require('./model/mongo.js');
var Mail  = require('./model/mail.js');
var Torrent = require('./model/torrent.js');
var OAuth = require('./model/omniauth.js');
var http = require('http');
var fs = require('fs');
var util = require('util');
var Transcoder = require('stream-transcoder');

//changer de mdp
//plus de langues
//historique plus instinctif et propre
//plus aucune strace des sockets
//casting
//poster 404
//passer le site 100% anglais
//film vu et non vu
//fct subtitles a commenter
//film supprimé apres un mois
//image de la page d'acceuil
//todo : sous titres

module.exports = function(router) {
    router.use(function (req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PROPFIND');
        res.header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type");
        next();
    });
    router.get('/', function (req, res) {
        res.send('Matcha API online ! try create reset login login[Omethod] myaccount useraccount film torrent or star');
    });

    router.post('/create', function (req, res) {
        Check.args(req, res, ['mail','pseudo','password','password2','firstname','lastname','image'])
            .then(Mongo.findMail)
            .then(Mongo.findPseudo)
            .then(Check.passwordCreate)
            .then(Check.accountInit)
            .then(Mongo.addUser)
            .then(Mail.welcome)
            .then(
                function(data) {console.log('... /create  OK');data.res.send({state:'success', json:'Votre compte à bien été créé.'});},
                function(data) {console.log(data.error);data.res.send({state:data.state, json:data.error});}
            );
    });
    router.post('/reset', function (req, res) {
        Check.args(req, res, ['pseudo','mail'])
            .then(Mongo.resetExists)
            .then(Check.hashNewPassword)
            .then(Mongo.resetApply)
            .then(Mail.resetPassword)
            .then(
                function(data) {console.log('... /reset  OK');data.res.send({state:'success', json:data.json});},
                function(data) {console.log(data.error);data.res.send({state:data.state, json:data.error});}
            );
    });
    router.post('/resetpass', function (req, res) {
        Check.args(req, res, ['password','password2'], ['token'])
            .then(Mongo.loggedin)
            .then(Check.updatePassword)
            .then(
                function(data) {console.log('... /resetpass  OK');data.res.send({state:'success', json: "Your password has been updated."});},
                function(data) {console.log(data.error);data.res.send({state:data.state, json:data.error});}
            );
    });
    router.post('/login', function (req, res) {
        Check.args(req, res, ['pseudo','password'])
            .then(Check.login)
            .then(Check.giveToken)
            .then(
                function(data) {console.log('... /login  OK');data.res.send({state:'success', json:data.json});},
                function(data) {console.log(data.error);data.res.send({state:data.state, json:data.error});}
            );
    });
    router.post('/login42', function (req, res) {
        Check.args(req, res, [], ['Ocode'])
            .then(OAuth.login42)
            .then(OAuth.retrieve42)
            .then(OAuth.OExistsOrCreate)
            .then(Check.giveToken)
            .then(
                function(data) {console.log('... /login42  OK');data.res.send({state:'success', json:data.json});},
                function(data) {console.log(data.error);data.res.send({state:data.state, json:data.error});}
            );
    });
    router.post('/loginGithub', function (req, res) {
        Check.args(req, res, [], ['Ocode'])
            .then(OAuth.loginGithub)
            .then(OAuth.retrieveGithub)
            .then(OAuth.OExistsOrCreate)
            .then(Check.giveToken)
            .then(
                function(data) {console.log('... /loginGithub  OK');data.res.send({state:'success', json:data.json});},
                function(data) {console.log(data.error);data.res.send({state:data.state, json:data.error});}
            );
    });
    router.post('/loginfb', function (req, res) {
        Check.args(req, res, [], ['Ocode'])
            .then(OAuth.loginfb)
            .then(OAuth.retrievefb)
            .then(OAuth.OExistsOrCreate)
            .then(Check.giveToken)
            .then(
                function(data) {console.log('... /loginfb  OK');data.res.send({state:'success', json:data.json});},
                function(data) {console.log(data.error);data.res.send({state:data.state, json:data.error});}
            );
    });
    router.post('/myaccount', function (req, res) {
        Check.args(req, res, [], ['token','mail','firstname','lastname','image','lang'])
            .then(Mongo.loggedin)
            .then(Mongo.updateProfile)
            .then(Mongo.findUserByToken)
            .then(
                function(data) {console.log('... /myaccount  OK');data.res.send({state:'success', json: data.json});},
                function(data) {console.log(data.error);data.res.send({state:data.state, json:data.error});}
            );
        });
    router.post('/useraccount', function (req, res) {
        Check.args(req, res, ['Opseudo'], ['token'])
            .then(Mongo.loggedin)
            .then(Mongo.findUserById)
            .then(Check.allInfos)
            .then(
                function(data) {console.log('... /useraccount  OK');data.res.send({state:'success', json:data.json});},
                function(data) {console.log(data.error);data.res.send({state:data.state, json:data.error});}
            );
    });
    router.post('/film', function (req, res) {
        Check.args(req, res, [], ['token','title','genre','sort','page','yearMin','yearMax','noteMin','noteMax'])
            .then(Mongo.loggedin)
            .then(Check.createRequest)
            .then(Check.makeRequest)
            .then(Check.getId)
            .then(Check.filmInfo)
            .then(Check.organiseInfo)
            .then(Check.triInfo)
            .then(Mongo.hasBeenWatched)
            .then(
                function(data) {console.log('... /film  OK');data.res.send({state:'success', json:data.json});},
                function(data) {console.log(data.error);data.res.send({state:data.state, json:data.error});}
            );
    });
    router.post('/comment', function (req, res) {
        Check.args(req, res, ['comment','imdbid'], ['token'])
            .then(Mongo.loggedin)
            .then(Mongo.addComment)
            .then(
                function(data) {console.log('... /comment  OK');data.res.send({state:'success', json:data.json});},
                function(data) {console.log(data.error);data.res.send({state:data.state, json:data.error});}
            );
    });
    router.post('/getTorrent', function (req, res) {
        Check.args(req, res, ['imdbid'], ['token'])
            .then(Mongo.loggedin)
            .then(Torrent.getTorrent)
            //.then(Torrent.getSubtitle)
            .then(Mongo.getComments)
            .then(Mongo.histoFilm)
            .then(
                function(data) {console.log('... /getTorrent  OK');data.res.send({state:'success', json:data.json});},
                function(data) {console.log(data.error);data.res.send({state:data.state, json:data.error});}
            );
    });
    router.post('/dlTorrent', function (req, res) {
        Check.args(req, res, ['hash'], ['token'])
            .then(Mongo.loggedin)
            .then(Torrent.downloadTorrent)
            .then(Mongo.saveFilm)
            .then(
                function(data) {console.log('... /dlTorrent  OK');data.res.send({state:'success', path:data.path});},
                function(data) {console.log(data.error);data.res.send({state:data.state, json:data.error});}
            );
    });

    router.get('/streaming/:file', function (req, res) {

        var film = req.params.file;

        var path = '../../films/' + film;
        var stat = fs.statSync(path);
        var total = stat.size;
        if (req.headers['range']) {
            var range = req.headers.range;
            var parts = range.replace(/bytes=/, "").split("-");
            var partialstart = parts[0];
            var partialend = parts[1];

            var start = parseInt(partialstart, 10);
            var end = partialend ? parseInt(partialend, 10) : total-1;
            var chunksize = (end-start)+1;
            console.log('RANGE: ' + start + ' - ' + end + ' = ' + chunksize);


            var file = fs.createReadStream(path, {start: start, end: end});
            res.writeHead(206, { 'Content-Range': 'bytes ' + start + '-' + end + '/' + total, 'Accept-Ranges': 'bytes', 'Content-Length': chunksize, 'Content-Type': 'video/mp4' });
            file.pipe(res);
        } else {
            console.log('ALL: ' + total);
            res.writeHead(200, { 'Content-Length': total, 'Content-Type': 'video/mp4' });
            var file = fs.createReadStream(path);
            file.pipe(res);
        }
    });
    router.get('/streaming/:folder/:file', function (req, res) {

        var film = req.params.folder+"/"+req.params.file;

        var path = '../../films/' + film;
        var stat = fs.statSync(path);
        var total = stat.size;
        if (req.headers['range']) {
            var range = req.headers.range;
            var parts = range.replace(/bytes=/, "").split("-");
            var partialstart = parts[0];
            var partialend = parts[1];

            var start = parseInt(partialstart, 10);
            var end = partialend ? parseInt(partialend, 10) : total-1;
            var chunksize = (end-start)+1;
            console.log('RANGE: ' + start + ' - ' + end + ' = ' + chunksize);


            var file = fs.createReadStream(path, {start: start, end: end});
            res.writeHead(206, { 'Content-Range': 'bytes ' + start + '-' + end + '/' + total, 'Accept-Ranges': 'bytes', 'Content-Length': chunksize, 'Content-Type': 'video/mp4' });
            file.pipe(res);
        } else {
            console.log('ALL: ' + total);
            res.writeHead(200, { 'Content-Length': total, 'Content-Type': 'video/mp4' });
            var file = fs.createReadStream(path);
            file.pipe(res);
        }
    });
    router.all('*', function (req, res) {
        res.send({state :'error', json:'Les informations que vous essayez d\'obtenir on peut être changé d\'adresse, veuillez contacter le support technique.'});
    });
};