var tpb = require('thepiratebay');
var fw = require('./fw');

var page = 0;
var limit = 30;
function recursive() {
    fw.authenticate(function() {
        tpb.search('', { category: '0', page: page, orderBy: '7' })
        .then(function(results){
            for(var i = 0; i < results.length; i++) {
                fw.postTorrent(results[i], function(){
                    console.log('done');
                });
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
