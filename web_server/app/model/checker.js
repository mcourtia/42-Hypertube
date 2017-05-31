var Promise = require('promise');
var Crypto  = require('crypto');
var http = require('http');
var https = require('https');

module.exports.args = function(req, res, obligatoire, facultatif) {
    return  new Promise(function(fullfil, reject) {
        console.log('VVV', req.url, "VVV");
        for (var i in obligatoire) {
            if (!req.body[obligatoire[i]]) {
                reject({'res': res, state:'validation', 'error': 'You missed a field.'});
            }
        }
        var regexp = {
            pseudo:     {reg: /^[a-zA-Z0-9]{3,30}$/, msg: "Your pseudo must contain 3 to 30 letters or numbers."},
            Opseudo:    {reg: /^.{3,50}$/, msg: "This user\'s pseudo is not valid."},
            mail:       {reg: /^[a-zA-Z0-9.!#$%&’*+\/=?^_`{|}~-]+@[a-zA-Z0-9\-]+(?:\.[a-zA-Z0-9-]+)*$/,msg: "Your e-mail is not valid."},
            password:   {reg: /^.{8,30}$/, msg: "Your password must contain 8 to 30 characters."},
            password2:  {reg: /^.{8,30}$/, msg: "Your second password must contain 8 to 30 characters."},
            firstname:  {reg: /^[a-zA-Z\- ]{2,30}$/,msg: "Your first name must contain 2 to 30 letters."},
            lastname:   {reg: /^[a-zA-Z\- ]{2,30}$/,msg: "Your last name must contain 2 to 30 letters."},
            image:      {reg: /^.{10,1000000}$/, msg: "Your photo is invalid, maximum size is 1Mb."},
            lang:       {reg: /^(fr|en|cn|jp|ru|es|it|de|eus)$/, msg: "Your language is not valid or not supported."},
            comment:    {reg: /^.{1,1000}$/, msg: "Your comment must be constructive, and do not spoil the others ;)"},

            Ocode:      {reg: /^.{1,500}$/, msg: "your Omniauth code is invalid."},
            token:      {reg: /^[a-zA-Z0-9]{42}$/, msg: "Your session token is invalid, Please reconnect."},

            title:      {reg: /^.{0,50}$/, msg: "The title must contain between 0 and 50 characters."},
            genre:      {reg: /^(pop|Action|Adventure|Animation|Comedy|Crime|Documentary|Drama|Family|Fantasy|History|Horror|Music|Mystery|Romance|Sci-Fi|Thriller|War|Western)$/, msg: "This genre is invalid."},
            page:       {reg: /^[0-9 ]{0,10}$/, msg: "Page number is invalid."},
            sort:       {reg: /^(pop|year|title|)$/, msg: "This sort is invalid."},
            yearMin:    {reg: /^[0-9]{4}$/, msg: "YearMin is invalid."},
            yearMax:    {reg: /^[0-9]{4}$/, msg: "YearMax is invalid."},
            noteMin:    {reg: /^[0-9]|10$/, msg: "NoteMin is invalid."},
            noteMax:    {reg: /^[0-9]|10$/, msg: "NoteMax is invalid."},
            imdbid:     {reg: /^tt[0-9]{7}$/, msg: "The imdbid is not valid."},
            hash:      {reg: /^[a-fA-F0-9]{1,100}$/, msg: "Hash invalid."}
        }
        for (var j in req.body) {
            if (!(obligatoire.indexOf(j) > -1) && !(facultatif.indexOf(j) > -1)) {
                console.log('[TMArguments]:');
                reject({'res': res, state:'error', error: 'Unauthorized field.'});
            }
            if (!(regexp[j].reg.test(req.body[j]))){
                reject({'res': res, state:'validation', 'error': regexp[j].msg});
            }
        }
        fullfil({'res': res, 'args': req.body});
    })
};

function keystr(nbcar) {
    var liste = "abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    var chaine = '';
    for(i = 0; i < nbcar; i++)
        chaine = chaine + liste[Math.floor(Math.random()*liste.length)];
    return chaine;
}

module.exports.passwordCreate = function(data) {
    return  new Promise(function(fullfil, reject) {
        if (data.args.password != data.args.password2)
            reject({'res': data.res, state:'validation', 'error': 'Passwords are different'});
        var pass = {};
        if (pass.salt = keystr(21)) {
            if (pass.password = Crypto.createHash('sha512').update(pass.salt + data.args.password + pass.salt).digest('hex')) {
                data.args.pass = pass;
                delete data.args.password;
                delete data.args.password2;
                fullfil(data);
            }
        }
        else
            reject({'res': res, state:'error', error: 'Can\'t create string salt'});
    })
};

module.exports.hashNewPassword = function(data) {
    return new Promise(function(fullfil, reject) {
        data.new_pass = keystr(12);
        var pass = {};
        if (pass.salt = keystr(21)) {
            if (pass.password = Crypto.createHash('sha512').update(pass.salt + data.new_pass + pass.salt).digest('hex')) {
                data.pass = pass;
                fullfil(data);
            }
        }
        else
            reject({'res': res, state:'error', error: 'Can\'t create string salt'});
    })
};

module.exports.updatePassword = function(data) {
    return  new Promise(function(fullfil, reject) {
        mongodb.collection('users').findOne({'pass.token': data.token}, function (err, result) {
            if (err)
                reject({'res': data.res, state:'error', error: 'Db error.'});
            else {
                if (!result)
                    reject({'res': data.res, state:'validation', error: 'This user doesn\'t exist'});
                else {
                    if (result.pass.password !== Crypto.createHash('sha512').update(result.pass.salt + data.args.password + result.pass.salt).digest('hex'))
                        reject({'res': data.res, state:'error', error: 'Wrong password'});
                    else {
                        var pass = {token: data.token};
                        if (pass.salt = keystr(21)) {
                            if (pass.password = Crypto.createHash('sha512').update(pass.salt + data.args.password2 + pass.salt).digest('hex')) {
                                mongodb.collection('users').update({'pass.token': data.token}, {$set: {pass: pass}}, function (err, result) {
                                    if (err)
                                        reject({'res': data.res, state:'error', error: 'Db error'});
                                    else {
                                        if (!result)
                                            reject({'res': data.res, state:'validation', error: 'Your password failed to update, please try again'});
                                        else
                                            fullfil(data);
                                    }
                                });
                            }
                        }
                        else
                            reject({'res': res, state:'error', error: 'Can\'t create string salt'});
                    }
                }
            }
        });
    })
};

module.exports.accountInit = function(data) {
    return  new Promise(function(fullfil, reject) {
        data.args.histo = [];
        data.args.lang = "en";
        fullfil(data);
    })
};

module.exports.login = function(data) {
    return  new Promise(function(fullfil, reject) {
        mongodb.collection('users').findOne({pseudo: data.args.pseudo},{pseudo:1, pass:1}, function (err, result) {
            if (err)
                reject({'res': data.res, state:'error', error: 'Db error'});
            else {
                if (!result)
                    reject({'res': data.res, state:'validation', error: 'This user doesn\'t exist'});
                else {
                    if (result.pass.password !== Crypto.createHash('sha512').update(result.pass.salt + data.args.password + result.pass.salt).digest('hex'))
                        reject({'res': data.res, state:'error', error: 'Wrong password'});
                    else
                        fullfil(data);
                }
            }
        });
    })
};

module.exports.giveToken= function(data) {
    return  new Promise(function(fullfil, reject) {
        var token = keystr(42);
        date = new Date().getTime();
        mongodb.collection('users').update({pseudo: data.args.pseudo},{$set:{'pass.token': token, lastSeen: date}}, function (err, result) {
            if (err)
                reject({'res': data.res, state:'error', error: 'Db error.'});
            else {
                if (!result)
                    reject({'res': data.res, state:'error', error: 'Your session couldn\'t be registered, please try again.'});
                else
                    fullfil({res: data.res, json: token});
            }
        });
    })
};

function lastSeen(lastseen) {
    if (!lastseen) {
        message = '';
    }
    else if (lastseen > new Date().getTime() - 900000){
        message = 'Connecté';
    }
    else if (Math.floor(lastseen / 86400000) == Math.floor(new Date().getTime() / 86400000)) {
        date = new Date(lastseen);
        message = "Last seen at " + (date.getHours() + 1) + ":" + (date.getMinutes() + 1);
    }
    else {
        var mois = ["janvier", "fevrier", "mars", "avril", "mai", "juin", "juillet", "aout", "septembre", "octobre", "novembre", "decembre"];
        date = new Date(lastseen);
        message = "Last seen on " + date.getDate() + " " + mois[date.getMonth()] + " " + date.getFullYear();
    }
    return message;
}

module.exports.allInfos = function(data) {
    return  new Promise(function(fullfil, reject) {
        data.json.lastConnect = lastSeen(data.json.lastSeen);
        fullfil(data);
    })
};



module.exports.createRequest = function(data) {
    return  new Promise(function(fullfil, reject) {
        //console.log("  t:" + data.args.title + "  g:" + data.args.genre + "  s:" + data.args.sort + "  p:" + data.args.page);
        //console.log("  yearMin:" + data.args.yearMin + "  yearMax:" + data.args.yearMax + "  noteMin:" + data.args.noteMin + "  noteMax:" + data.args.noteMax);

        var options = '?api_key=77bf4dda1915270371d6dd3884e7cca9&language=en-US&include_adult=false';//&vote_count.gte=10';

        if (data.args.title === '' || data.args.title === undefined) {
            options += '&primary_release_date.gte='+data.args.yearMin+'-01-01&primary_release_date.lte='+data.args.yearMax+'-12-31';
            options += '&vote_average.lte='+data.args.noteMax+'&vote_average.gte='+data.args.noteMin;
            var with_genres = {
                'Action'      :'&with_genres=28',
                'Adventure'   :'&with_genres=12',
                'Animation'   :'&with_genres=16',
                'Comedy'      :'&with_genres=35',
                'Crime'       :'&with_genres=80',
                'Documentary' :'&with_genres=99',
                'Drama'       :'&with_genres=18',
                'Family'      :'&with_genres=10751',
                'Fantasy'     :'&with_genres=14',
                'History'     :'&with_genres=36',
                'Horror'      :'&with_genres=27',
                'Music'       :'&with_genres=10402',
                'Mystery'     :'&with_genres=9648',
                'Romance'     :'&with_genres=10749',
                'Sci-Fi'      :'&with_genres=878',
                'Thriller'    :'&with_genres=53',
                'War'         :'&with_genres=10752',
                'Western'     :'&with_genres=37',
                'pop'         :'',
                ''            :''
            };
            var sort_by = {
                'year' :'&sort_by=primary_release_date.desc',
                'title':'&sort_by=original_title.asc',
                'pop'  :'&sort_by=popularity.desc',
                ''     :'&sort_by=popularity.desc'
            };
            request = '3/discover/movie'+ options + '&page=' + data.args.page + with_genres[data.args.genre] + sort_by[data.args.sort]+ '&include_video=false';
        }
        else {
            request = '3/search/movie' + options + '&page=' + data.args.page + '&query=' + data.args.title + '&append_to_response=external_ids';
        }
        data.request = request;
        //console.log(request);
        fullfil(data);
    })
};

module.exports.makeRequest = function(data) {
    return new Promise(function(fullfil, reject){
        http.get('http://api.themoviedb.org/' + data.request, function(res) {
            var jResult = '';
            res.on('data', function (chunk) {
                jResult += chunk;
            });
            res.on('end', function(){
                data.jsonApiRequest = JSON.parse(jResult);
                fullfil(data);
                })
        }).on('error', function(e) {
            console.log("Got error: " + e.message + "-> TMDB ERROR");
            if(e.message === '429')
                reject({'res': data.res, state:'validation', error: 'Too much request : try again in a few seconds !'});
            else
                reject({'res': data.res, state:'validation', error: 'film api didn\'t respond'});
        });
    })
};

module.exports.getId = function (data) {
  return new Promise(function (fullfil, reject) {
      var infoT = [];
      var i = 0;
      data.jsonApiRequest.results.forEach(function (val) {
          if (val.release_date && val.title && val.popularity) {
              var year = val.release_date.substring(0, 4);
              var info = {
                  poster: val.poster_path,
                  backdrop: val.backdrop_path,
                  release: val.release_date,
                  year: year,
                  title: val.title,
                  popularity: val.popularity,
                  vote_average: val.vote_average
              };
              infoT.push(info);
              if (i === data.jsonApiRequest.results.length - 1) {
                  data.Tinfo = {tmdb: infoT};
                  fullfil(data);
              }
              else
                  i++;
          }
          else
              i++;
      });
  })
};

module.exports.filmInfo = function(data) {
  return new Promise(function (fullfil, reject) {
      var allInfo = [];
      var i = 0;
      data.Tinfo.tmdb.forEach(function (val) {
          http.get('http://www.omdbapi.com/?apikey=cc0277b0&t=' + val.title + '&y=' + val.release_year + '&plot=full', function(res) {
              var jResult = '';
              res.on('data', function (chunk) {
                  jResult += chunk;
              });
              res.on('end', function(){
                  var filmInfo = {};
                  if(jResult.substring(0,2) !== '<!' && jResult.substring(0,6)  !== '<html>' && jResult.substring(0,7) !== '{"state' && jResult.substring(0,21) !== '{"Title":"A Gun, a Ca') {
                      filmInfo.imdb = JSON.parse(jResult);
                      ///filmInfo.imdb.Plot = filmInfo.imdb.Plot.replace(/[\\]/, '');
                      filmInfo.tmdb = val;
                      allInfo.push(filmInfo);
                  }
                  if (i === data.Tinfo.tmdb.length - 1) {
                      data.info = {results: allInfo};
                      fullfil(data);
                  }
                  else
                      i++;
              })
          }).on('error', function(e) {
              console.log("Got error: " + e.message + "-> OMDB ERROR");
              reject({'res': data.res, state:'validation', error: 'film api didn\'t respond'});
          });
      })
  })
};

module.exports.organiseInfo = function (data) {
    return new Promise(function(fullfil, reject) {
        var info = data.info.results;
        var cleanInfo = [];
        for (var i = 0; i <= info.length - 1; i++) {
            var filmInfo = {};
            filmInfo.title = info[i].imdb.Title;
            filmInfo.imdbid = info[i].imdb.imdbID;
            filmInfo.poster_path = info[i].tmdb.poster;
            filmInfo.backdrop_path = info[i].tmdb.backdrop;
            filmInfo.genre =  info[i].imdb.Genre;
            filmInfo.release_date = info[i].tmdb.release;
            filmInfo.year = info[i].tmdb.year;
            filmInfo.duree =  info[i].imdb.Runtime;
            filmInfo.director =  info[i].imdb.Director;
            filmInfo.writer =  info[i].imdb.Writer;
            filmInfo.actor =  info[i].imdb.Actors;
            filmInfo.plot =  info[i].imdb.Plot;
            filmInfo.popularity = info[i].tmdb.popularity;
            filmInfo.note = info[i].tmdb.vote_average;
            filmInfo.production =  info[i].imdb.Production;
            filmInfo.watched = 'no_watched';
            cleanInfo.push(filmInfo);
            if (i === info.length - 1) {
                data.json = {results : cleanInfo};
                fullfil(data);
            }

        }
    })
};

module.exports.triInfo = function (data) {
    return new Promise(function(fullfil, reject){
        if (data.args.sort === 'pop')
        {
            data.json.results.sort(function (a, b) {
                return a.popularity - b.popularity;
            });
            data.json.results.reverse();
        }
        if (data.args.sort === 'year')
        {
            data.json.results.sort(function (a, b) {
                if (a.release_date < b.release_date) return -1;
                else if (a.release_date_ === b.release_date) return 0;
                else return 1;
            });
            data.json.results.reverse();
        }
        if (data.args.sort === 'title')
        {
            data.json.results.sort(function (a, b) {
                if (a.title < b.title) return -1;
                else if (a.title === b.title) return 0;
                else return 1;
            });
        }
        fullfil(data);
    })
};