var nodemailer = require('nodemailer');

module.exports.resetPassword = function(data) {
        return new Promise(function(fullfil, reject) {
            var transporter = nodemailer.createTransport({
                host: '46.101.7.5',
                port: 4203,
                ignoreTLS: true
            });
            var mailOptions = {
                from: 'The Hypertube team',
                to: data.args.mail,
                subject: 'Reseting your password',
                text: 'Your new password for hypertube is : ' + data.new_pass,
                html: 'Your new password for hypertube is : <b>' + data.new_pass + ' !<b/>'
            };
            transporter.sendMail(mailOptions, function(error, info){
                transporter.close();
                fullfil(data);
            });
        })
    };

module.exports.welcome = function(data) {
    return new Promise(function(fullfil, reject) {
        var transporter = nodemailer.createTransport({
            host: '46.101.7.5',
            port: 4203,
            ignoreTLS: true
        });
        var mailOptions = {
            from: 'The hypertube team',
            to: data.args.mail,
            subject: 'Welcome to hypertube',
            text: 'Welcome to hypertube '+data.args.pseudo+' !',
            html: 'Welcome to hypertube <b>'+data.args.pseudo+' !<b/>'
        };
        transporter.sendMail(mailOptions, function(error, info){
            transporter.close();
            fullfil(data);
        });
    })
};