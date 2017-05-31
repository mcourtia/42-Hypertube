var Promise = require('promise');
var fs = require('fs');

module.exports.loggedin = function(data) {
    return new Promise(function(fullfil, reject) {
        if (!data.args.token)
            reject({'res': data.res, state:'error', error: 'You\'re not logged in'});
        else {
            mongodb.collection('users').findOne({'pass.token': data.args.token}, {pseudo: 1, lastSeen:1}, function (err, result) {
                if (err)
                    reject({'res': data.res, state:'error', error: 'Db error'});
                else {
                    if (result)
                    {
                        data.token = data.args.token;
                        data.user = result;
                        delete data.args.token;
                        date = new Date().getTime();
                        if (date - result.lastSeen > 2700000)
                            reject({'res': data.res, state:'error', error: 'Your session has expired after 15 minutes, please reconnect'});
                        else
                        {
                            mongodb.collection('users').update({'pass.token': data.token}, {$set: {lastSeen: date}}, function (err, result) {
                                if (err)
                                    reject({'res': data.res, state:'error', error: 'Db error.'});
                                else
                                    fullfil(data);
                            });
                        }
                    }
                    else
                        reject({'res': data.res, state:'error', error: 'Your session has expired, please reconnect'});
                }
            });
        }
    })
};

//--------CREATION
module.exports.findMail = function(data) {
    return new Promise(function(fullfil, reject) {
        mongodb.collection('users').findOne({mail: data.args.mail}, function (err, result) {
            if (err)
                reject({'res': data.res, state:'error', error: 'Db error.'});
            else {
                if (result)
                    reject({'res': data.res, state:'validation', error: 'This email is already taken.'});
                else
                    fullfil(data);
            }
        });
    })
};
module.exports.findPseudo = function(data) {
    return new Promise(function(fullfil, reject) {
        mongodb.collection('users').findOne({pseudo: data.args.pseudo}, function (err, result) {
            if (err)
                reject({'res': data.res, state:'error', error: 'Db error.'});
            else {
                if (result)
                    reject({'res': data.res, state:'validation', error: 'This pseudo is already taken.'});
                else
                    fullfil(data);
            }
        });
    })
};
module.exports.addUser = function(data) {
    return new Promise(function(fullfil, reject) {
        mongodb.collection('users').insertOne(data.args, function (err) {
            if (!err)
                fullfil(data);
            else
                reject({'res': data.res, state:'error', error: err});
        });
    })
};
module.exports.resetExists = function(data) {
    return new Promise(function(fullfil, reject) {
        mongodb.collection('users').findOne(data.args,{_id:0, pass:0, mail:0},null,null, function (err, result) {
            if (err)
                reject({'res': data.res, state:'error', error: 'Db error.'});
            else {
                if (result)
                    fullfil(data);
                else
                    reject({'res': data.res, state:'error', error: 'No account found'});
            }
        });
    })
};
module.exports.resetApply = function(data) {
    return new Promise(function(fullfil, reject) {
        mongodb.collection('users').update(data.args,{$set: {pass: data.pass}}, function (err, result) {
            if (err)
                reject({'res': data.res, state:'error', error: 'Db error.'});
            else {
                if (!result)
                    reject({'res': data.res, state:'validation', error: 'Your modifications didn\'t applied, please try again'});
                else
                    fullfil(data);
            }
        });
    })
};

//---------MYACCOUNT
module.exports.updateProfile = function(data) {
    return new Promise(function(fullfil, reject) {
        if (Object.keys(data.args).length) {
            mongodb.collection('users').update({'pass.token': data.token}, {$set: data.args}, function (err, result) {
                if (err)
                    reject({'res': data.res, state:'error', error: 'Db error.'});
                else {
                    if (!result)
                        reject({'res': data.res, state:'validation', error: 'Your modifications didn\'t applied, please try again'});
                    else
                        fullfil(data);
                }
            });
        }
        else
            fullfil(data);
    })
};
module.exports.findUserByToken = function(data) {
    return new Promise(function(fullfil, reject) {
        mongodb.collection('users').findOne({'pass.token': data.token},{_id:0, pass:0},null,null, function (err, result) {
            if (err)
                reject({'res': data.res, state:'error', error: 'Db error.'});
            else {
                if (result)
                    fullfil({'res': data.res, json: result});
                else
                    reject({'res': data.res, state:'error', error: 'No account found'});
            }
        });
    })
};

//--------SEARCH USER
module.exports.retrieveUser = function(data) {
    return new Promise(function(fullfil, reject) {
        mongodb.collection('users').findOne({'pass.token': data.token},{_id:0, pass:0},null,null, function (err, result) {
            if (err)
                reject({'res': data.res, state:'error', error: 'Db error.'});
            else {
                if (result) {
                    data.user = result;
                    fullfil(data);
                }
                else
                    reject({'res': data.res, state:'error', error: 'No account found'});
            }
        });
    })
};
module.exports.findUserById = function(data) {
    return new Promise(function(fullfil, reject) {
        mongodb.collection('users').findOne({pseudo: data.args.Opseudo},
            {pseudo:1, firstname:1, lastname:1, image:1, lastSeen:1},null,null, function (err, result) {
            if (err)
                reject({'res': data.res, state:'error', error: 'Db error.'});
            else {
                if (result) {
                    data.json = result;
                    fullfil(data);
                }
                else
                    reject({'res': data.res, state:'error', error: 'No account found with this pseudo'});
            }
        });
    })
};

module.exports.hasBeenWatched = function(data) {
    return new Promise(function(fullfil, reject) {
        mongodb.collection('users').findOne({'pass.token': data.token}, function (err, result) {
            if (err)
                reject({'res': data.res, state:'error', error: 'Db error'});
            else {
                if (result) {
                    data.json.results.forEach(function(val) {
                        val.watched = 'no_watched';
                        result.histo.forEach(function(in_histo) {
                            if (in_histo.imdbid === val.imdbid) {
                                val.watched = 'watched';
                            }
                        });
                    });
                    fullfil(data);
                }
                else
                    reject({'res': data.res, state:'error', error: 'No user found.'});
            }
      });
  })
};

//--------COMMENTAIRES
module.exports.getComments = function(data) {
    return new Promise(function(fullfil, reject) {
        mongodb.collection('comments').find({imdbid: data.args.imdbid}).toArray(function (err, result) {
            if (err)
                reject({'res': data.res, state:'error', error: 'Db error.'});
            else {
                data.json.comments = (result) ? result : {};
                fullfil(data);
            }
        });
    })
};
module.exports.addComment = function(data) {
    return new Promise(function(fullfil, reject) {
        var dt = new Date();
        var date = (dt.getMonth() + 1) + "/" + dt.getDate() + "/" + dt.getFullYear();
        mongodb.collection('comments').insert({comment: data.args.comment, user: data.user.pseudo, date: date, imdbid: data.args.imdbid}, function (err, result) {
            if (err)
                reject({'res': data.res, state:'error', error: 'Db error.'});
            else {
                fullfil(data);
            }
        });
    })
};

//--------FILMS
module.exports.histoFilm = function(data) {
    console.log('histo ok');
    return new Promise(function(fullfil, reject) {
        mongodb.collection('users').update({'pass.token': data.token}, {$pull: {histo :{imdbid: data.args.imdbid}}}, function (err, result) {
            if (err)
                reject({'res': data.res, state:'error', error: 'Db error'});
            else {
                mongodb.collection('users').update({'pass.token': data.token}, {$push: {histo :{title: data.json.title, imdbid: data.args.imdbid}}}, function (err, result) {
                    if (err)
                        reject({'res': data.res, state:'error', error: 'Db error'});
                    else
                        fullfil(data);
                });
            }
        });
    })
};

module.exports.saveFilm = function(data) {
    return new Promise(function(fullfil, reject) {
        var a = new Date();
        var time = a.getTime();
        mongodb.collection('films').update({path: data.path}, {$set: {path: data.path, time: time}}, {upsert: true}, function (err, result) {
            if (err)
                reject({'res': data.res, state:'error', error: 'Db error'});
            else {
                var comp = time - 2600000000;
                mongodb.collection('films').find({time: {$lt: comp}}).toArray(function (err, res) {
                    if (err)
                        reject({'res': data.res, state:'error', error: 'Db error'});
                    else {
                        res.forEach(function(val) {
                            console.log("unlinking : /films/", val.path);
                            fs.unlinkSync("/films/"+val.path);
                        });
                        mongodb.collection('films').remove({time: {$lt: comp}}, function (err, result) {
                            if (err)
                                reject({'res': data.res, state:'error', error: 'Db error'});
                            else
                                fullfil(data);
                        });
                    }
                });
            }
        });
    });
};