module.exports = function (http, listOfConnected) {

    var io = require('socket.io').listen(http);
    var torrentStream = require('torrent-stream');
    var fs = require('fs');

    io.sockets.on('connection', function (socket) {
        console.log('new socket recieved.');

        socket.on('login', function (user) {
            mongodb.collection('users').findOne({'pass.token': user.token},{pseudo:1}, function (err, result) {
                if (!err && result) {
                    listOfConnected[result.pseudo] = socket.id;
                    console.log("user",result.pseudo,"just connected");
                    console.log(listOfConnected);
                }
            });
        });
        /*
        socket.on('startStreaming', function(magnet) {
            console.log('socket startStreaming w/ magnet : ',magnet);
            //magnet:?xt=urn:btih:TORRENT_HASH&dn=Url+Encoded+Movie+Name&tr=http://track.one:1234/announce&tr=udp://track.two:80
            //var magnet = 'magnet:?xt=urn:btih:96ef67edcbef64576ee64b040847583582e1085f';
            magnet = 'magnet:?xt=urn:btih:c0d9af9ef43319f69cfecbee78ececa61f83a00e';
            var engine = torrentStream(magnet,{path: '/films'});

            engine.on('ready', function() {
                console.log('ready');
                engine.files.forEach(function(file) {
                    if (file.name.substr(file.name.length - 3) == 'mkv' || file.name.substr(file.name.length - 3) == 'mp4') {
                        console.log('now streaming :', file.name);
                        var stream = file.createReadStream();
                    }
                });
            });

            engine.on('download', function(n) {
                console.log('one piece has been downloaded', n);
                socket.emit('newPiece', n);
            });

            engine.on('idle', function() {
                console.log('end');
            });
            fullfil(data);

        });
        */
    });
};