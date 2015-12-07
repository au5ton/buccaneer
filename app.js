var tpb = require('thepiratebay');
var fw = require('./fw');

var page = 9;
var limit = 30;
var postCount = 0;
var postLimit = 20; //Daily limit imposed by Fluff
function recursive() {
    console.log('STARTING PAGE '+page);
    fw.authenticate(function() {
        tpb.search('', { category: '0', page: page, orderBy: '7' })
        .then(function(results){
            for(var i = 0; i < results.length; i++) {
                if(fw.postCount < postLimit) {
                    fw.postTorrent(results[i], function(){
                        console.log('done');
                    });
                }
                //console.log(fw.categoryMatcher(results[i]));
            }

            if(page < limit) {
                page++;
                recursive();
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
