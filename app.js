var tpb = require('thepiratebay');


tpb.recentTorrents()
.then(function(results){
    for(var i = 0; i < results.length; i++) {
        console.log(results[i]['name']);
    }
}).catch(function(err){
    console.log(err);
});
