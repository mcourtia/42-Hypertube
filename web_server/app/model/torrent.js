var Promise = require('promise');
var http = require('http');
var https = require('https');

var pump = require('pump');
var torrentStream = require('torrent-stream');
var fs = require('fs');
var bencode = require('bencode');
const OS = require('opensubtitles-api');
const OpenSubtitles = new OS({
    useragent:'OSTestUserAgentTemp'
});

module.exports.getTorrent = function (data) {
    return new Promise(function(fullfil, reject) {
        https.get('https://yts.ag/api/v2/list_movies.json?query_term=' + data.args.imdbid, function (res) {
            var jResult = '';
            res.on('data', function (chunk) {
                jResult += chunk;
            });
            res.on('end', function(){
                var tmp = JSON.parse(jResult);
                if(tmp.data.movie_count > 0) {
                    data.json = tmp.data.movies[0];
                    //console.log(data.json);
                    fullfil(data);
                }
                else {
                    reject({'res': data.res, state:'error', error: 'There is no torrent for this movie :('});
                }
            })
        }).on('error', function(e) {
            console.log("Got error: " + e.message + "-> YTSERROR");
            reject({'res': data.res, state:'validation', error: 'The torrent api did not respond'});
        });
    })
};

/*module.exports.getSubtitle = function (data) {
    return new Promise(function(fullfil, reject) {
        var a = ["fre", "eng"];
        OpenSubtitles.search({imdbid: data.args.imdbid, sublanguageid: a.join()}).then(subtitle => {
            //console.log(subtitle);
            fullfil(data);
        })
    });
};*/

module.exports.downloadTorrent = function(data) {
    return new Promise(function (fullfil, reject) {
        var magnet = 'magnet:?xt=urn:btih:' + data.args.hash;
        var engine = torrentStream(magnet,{path: '/films'});

        engine.on('ready', function() {
            console.log('torrent dl ready:');
            engine.files.forEach(function(file) {
                if (file.name.substr(file.name.length - 3) == 'mkv' || file.name.substr(file.name.length - 3) == 'mp4') {
                    console.log('   Now streaming :', file.name);
                    var stream = file.createReadStream();
                    data.path = file.path;
                    fullfil(data);
                }
            });
        });

        engine.on('download', function(data) {
            console.log('       piece downloaded :', data);
        });

        engine.on('idle', function() {
            console.log('torrent end');
        });
    });
};