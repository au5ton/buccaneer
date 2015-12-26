var tpb = require('thepiratebay');
var fw = require('./fw');
var https = require('https');

var LOGIN = {};
var page = 0; //TVD
function recursive_torrents() {
    console.log('STARTING PAGE '+page);
    fw.authenticate(function() {
        tpb.search('The Big Bang Theory', {
            category: '0',
            page: page,
            orderBy: '7'
        })
        .then(function(results){
            for(var i = 0; i < results.length; i++) {
                if(results[i]['seeders'] > 0) {
                    fw.postTorrent(results[i], function(){
                        console.log('done');
                    });
                }
            }
            page++;
            recursive_torrents();
        }).catch(function(err){
            console.log(err);
        });
    });
}

function recursive_toptorrents() {
    fw.authenticate(function() {
        tpb.topTorrents()
        .then(function(results){
            for(var i = 0; i < results.length; i++) {
                    fw.postTorrent(results[i], function(){
                        console.log('done');
                    });
                //console.log(fw.categoryMatcher(results[i]));
            }
        }).catch(function(err){
            console.log(err);
        });
    });
}

var chatCount = 1;
var chatLimit;
var chatMessage;
var chatLimitInfinite = false;

function recursive_chat() {
    console.log('Posting chat message #'+chatCount+'...');
    fw.chatMessage(chatMessage, function(){
        if(chatLimitInfinite === true) {
            chatCount++;
            recursive_chat();
        }
        else if(chatCount < chatLimit) {
            chatCount++;
            recursive_chat();
        }
    });
}


if(process.argv[2] === '--spamChat') {
    chatMessage = process.argv[3];
    chatLimit = parseInt(process.argv[4]);
    if(chatLimit === -1) {
        chatLimitInfinite = true;
        console.log('WARNING! Chat limit set to INFINITY!');
    }
    fw.authenticate(function(){
        recursive_chat();
    });
}
else if(process.argv[2] === '--chat') {
    chatMessage = process.argv[3];
    fw.authenticate(function(){
        fw.chatMessage(chatMessage);
    });
}
else if(process.argv[2] === '--spamTorrents') {
    recursive_torrents();
}
else if(process.argv[2] === '--spamTopTorrents') {
    recursive_toptorrents();
}
else {

    tpb.search('The Big Bang Theory', {
        category: '0',
        orderBy: '7'
    }).then(function(results){
        //console.log(results);
        for(var i = 0; i < results.length; i++) {
            console.log(results[i]['name']);
            console.log(results[i]['seeders']);
            //console.log(results[i]['magnetLink']);
            //console.log(fw.categoryMatcher(results[i]));
        }
    }).catch(function(err){
        console.log(err);
    });

    // tpb.topTorrents()
    // .then(function(results){
    //     for(var i = 0; i < results.length; i++) {
    //         console.log(results[i]['name']);
    //         console.log(results[i]['seeders']);
    //         //console.log(fw.categoryMatcher(results[i]));
    //     }
    //
    // }).catch(function(err){
    //     console.log(err);
    // });
}
