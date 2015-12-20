var FW = {};

var constants = require('./constants'); //Not included in source control for security

var https = require('https');
var querystring = require('querystring');

FW.postCount = 0;

FW.authenticate = function(callback) {

    if(callback === undefined) {
        callback = function() {};
    }

    var err;

    console.log('Attempting to authenticate with cookie '+constants.cookie);

    var req = https.request({
        hostname: constants.host,
        path: '/home.php',
        method: 'GET',
        headers: {
            'Cookie': constants.cookie
        }
    }, function(res) {
        if(res.statusCode === 200) {
            console.log('✅ authenticate');
        }
        else {
            console.log('⚠️ authenticate');
            err = 'failed';
        }
        //console.log('STATUS: ' + res.statusCode);
        //console.log('HEADERS: ' + JSON.stringify(res.headers));
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            //console.log('BODY: ' + chunk);
        });
        res.on('end', function() {
            callback(err);
        })
    });
    req.on('error', function(e) {
        console.log('problem with request: ' + e.message);
    });
    req.end();
};

FW.chatMessage = function(message, callback) {

    //console.log('Attempting to submit \''+torrent.name+'\' to Fluff World...');

    if(callback === undefined) {
        callback = function(){};
    }

    var postData = querystring.stringify({
        'chat_text': message
    });

    var data = '';

    var req = https.request({
        hostname: constants.host,
        path: '/scripts/chat_post.php',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(postData),
            'Cookie': constants.cookie
        }
    }, function(res) {
        //console.log('STATUS: ' + res.statusCode);
        //console.log('HEADERS: ' + JSON.stringify(res.headers));
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            data += chunk;
        });
        res.on('end', function() {
            if(res.statusCode === 200) {
                console.log('✅ chatMessage');
            }
            else {
                console.log('⚠️ chatMessage');
            }
            //console.log(data);
            callback();
        })
    });

    req.on('error', function(e) {
        console.log('problem with request: ' + e.message);
    });

    // write data to request body
    req.write(postData);
    req.end();
};

FW.postTorrent = function(torrent, callback) {

    console.log('Attempting to submit \''+torrent.name+'\' to Fluff World...');

    var postData = querystring.stringify({
        'tor_name': torrent.name,
        'tor_hash': torrent.magnetLink,
        'tor_cat': FW.categoryMatcher(torrent)
    });

    var data = '';

    var req = https.request({
        hostname: constants.host,
        path: '/scripts/torrent_upload.php',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(postData),
            'Cookie': constants.cookie
        }
    }, function(res) {
        //console.log('STATUS: ' + res.statusCode);
        //console.log('HEADERS: ' + JSON.stringify(res.headers));
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            data += chunk;
        });
        res.on('end', function() {
            if(data === 'success') {
                console.log('✅ postTorrent');
                FW.postCount++;
            }
            else {
                console.log('⚠️ postTorrent');
            }
            console.log(data);
            callback();
        })
    });

    req.on('error', function(e) {
        console.log('problem with request: ' + e.message);
    });

    // write data to request body
    req.write(postData);
    req.end();
};

FW.categoryMatcher = function(torrent) {

    var Ledger = {
        'Video - Movies': 11,
        'Video - TV Shows': 12,
        'Video - General': 10,
        'Audio - Music': 21,
        'Audio - Audiobooks': 22,
        'Audio - General': 20,
        'Applications - Windows': 31,
        'Applications - Mac': 32,
        'Apps - iOS': 33,
        'Apps - Android': 34,
        'Games - PC': 41,
        'Games - Mac': 42,
        'Games - Playstation': 43,
        'Games - Xbox': 44,
        'Games - Wii': 45,
        'Games - Handheld': 46,
        'Games - iOS': 47,
        'Games - Android': 48,
        'Games - Retro': 49,
        'E-Books': 51,
        'General Documents': 52
    };

    if(torrent.subcategory.id.charAt(0) === '1') {
        if(torrent.subcategory.id.charAt(2) === '1') {
            return Ledger['Audio - Music'];
        }
        else if(torrent.subcategory.id.charAt(2) === '2') {
            return Ledger['Audio - Audiobooks'];
        }
        else {
            return Ledger['Audio - General'];
        }
    }
    else if(torrent.subcategory.id.charAt(0) === '2'){
        if(torrent.subcategory.id.charAt(2) === '1' || torrent.subcategory.id.charAt(2) === '2' || torrent.subcategory.id.charAt(2) === '7') {
            return Ledger['Video - Movies'];
        }
        else if(torrent.subcategory.id.charAt(2) === '5' || torrent.subcategory.id.charAt(2) === '8') {
            return Ledger['Video - TV Shows'];
        }
        else {
            return Ledger['Video - General'];
        }
    }
    else if(torrent.subcategory.id.charAt(0) === '3'){
        if(torrent.subcategory.id.charAt(2) === '1') {
            return Ledger['Applications - Windows'];
        }
        else if(torrent.subcategory.id.charAt(2) === '2') {
            return Ledger['Applications - Mac'];
        }
        else if(torrent.subcategory.id.charAt(2) === '5') {
            return Ledger['Apps - iOS'];
        }
        else if(torrent.subcategory.id.charAt(2) === '6') {
            return Ledger['Apps - Android'];
        }
        else {
            return Ledger['General Documents'];
        }
    }
    else if(torrent.subcategory.id.charAt(0) === '4'){
        if(torrent.subcategory.id.charAt(2) === '1') {
            return Ledger['Games - PC'];
        }
        else if(torrent.subcategory.id.charAt(2) === '2') {
            return Ledger['Games - Mac'];
        }
        else if(torrent.subcategory.id.charAt(2) === '3') {
            return Ledger['Games - Playstation'];
        }
        else if(torrent.subcategory.id.charAt(2) === '4') {
            return Ledger['Games - Xbox'];
        }
        else if(torrent.subcategory.id.charAt(2) === '5') {
            return Ledger['Games - Wii'];
        }
        else if(torrent.subcategory.id.charAt(2) === '6') {
            return Ledger['Games - Handheld'];
        }
        else if(torrent.subcategory.id.charAt(2) === '7') {
            return Ledger['Games - iOS'];
        }
        else if(torrent.subcategory.id.charAt(2) === '8') {
            return Ledger['Games - Android'];
        }
        else {
            return Ledger['General Documents'];
        }
    }
    else if(torrent.subcategory.id.charAt(0) === '5'){
        if(torrent.subcategory.id.charAt(2) === '1' || torrent.subcategory.id.charAt(2) === '2' || torrent.subcategory.id.charAt(2) === '5' || torrent.subcategory.id.charAt(2) === '6') {
            return Ledger['Video - Movies'];
        }
        else {
            return Ledger['Video - General'];
        }
    }
    else if(torrent.subcategory.id === '601'){
        return Ledger['E-Books'];
    }
    else {
        return Ledger['General Documents'];
    }
};

module.exports = FW;
