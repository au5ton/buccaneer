var tpb = require('thepiratebay');
var fw = require('./fw');

var page = 4;
var limit = 30;
var postCount = 0;
var postLimit = 20; //Daily limit imposed by Fluff
function recursive() {
    console.log('STARTING PAGE '+page);
    fw.authenticate(function() {
        tpb.search('', { category: '0', page: page, orderBy: '7' })
        .then(function(results){
            for(var i = 0; i < results.length; i++) {
                if(postCount < postLimit) {
                    fw.postTorrent(results[i], function(){
                        console.log('done');
                    });
                    postCount++;
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

recursive();
