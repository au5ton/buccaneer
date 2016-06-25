'use strict';

var api = require('fwapi');
var client = require('au5ton-logger');
var tpb = require('thepiratebay');
var colors = require('colors');

const LOGIN = {
    user: process.argv[2],
    pass: process.argv[3]
};

const ACTION = 4, MODE = 5;

let page = 0;

if(process.argv[2] === 'help' || process.argv[2] === '--help') {
    let ind = '    ';
    client.log('Key:'.yellow);
    client.log(ind, '{app} = node /path/to/app.js'.yellow);
    client.log(ind, '<required field>'.yellow);
    client.log(ind, '[optional field]'.yellow);
    client.log('Syntax:'.yellow);
    client.log(ind, 'Unauthenticated tasks:'.yellow);
    client.log(ind, ind, 'To search: {app} search [-cat <cat code>] [-query <querystring>]'.yellow);
    client.log(ind, ind, 'To show top: {app} show top'.yellow);
    client.log(ind, 'Authenticated tasks:'.yellow);
    client.log(ind, ind, 'To post: {app} <username> <password> post <all | top | best>'.yellow);
    process.exit();
}

if(process.argv[2] === 'search') {
    let category = '0';
    let query = '';
    //Search for arguments
    for(let i = 0; i < process.argv.length; i++) {
        if(process.argv[i] === '-cat') {
            category = process.argv[i+1];
        }
        if(process.argv[i] === '-query') {
            query = process.argv.splice(i+1).join(' ');
        }
    }

    if(category === 'ALL_AUDIO') {
        category = '100';
    }
    if(category === 'ALL_VIDEO') {
        category = '200';
    }
    if(category === 'ALL_APPS') {
        category = '300';
    }
    if(category === 'ALL_GAMES') {
        category = '400';
    }
    if(category === 'ALL_PORN') {
        category = '500';
    }

    client.log('Searching TPB under category \'',category,'\' for: \'',query,'\'...');

    tpb.search(query, {
        category: category,
        orderBy: '7'
    }).then(function(results){
        for(var i = 0; i < results.length; i++) {
            client.log('[',results[i]['seeders'], '] ', results[i]['name']);
        }
    }).catch(function(err){
        client.log(err)
    });
}
else if(process.argv[2] === 'show') {
    if(process.argv[3] === 'top') {
        tpb.topTorrents()
        .then(function(results){
            for(var i = 0; i < results.length; i++) {
                let ind = '    ';
                client.log('[',results[i]['seeders'], '] ', results[i]['name']);
                client.log(ind, 'cat:',results[i]['subcategory']);
            }
        }).catch(function(err){
            client.log(err);
        });
    }
}
else {
    api.auth.authenticate(LOGIN.user, LOGIN.pass, function(status){
        if(status === 'success') {
            api.torrent.setCookie(api.auth.cookie);
            if(process.argv[ACTION] === 'post') {
                recur(process.argv[MODE]);
            }
        }
    },true);
}



let recur = function(action) {
    if(action === 'all') {
        recur('top');
        recur('best');
    }
    else if(action === 'top') {
        tpb.topTorrents()
        .then(function(results){
            for(var i = 0; i < results.length; i++) {
                let tor = new api.torrent.Torrent({
                    name: results[i]['name'],
                    magnetLink: results[i]['magnetLink'],
                    subcategory: results[i]['subcategory']['id']
                });
                api.torrent.locallyValidateTorrent(tor, function(status) {
                    if(status === 'success') {
                        //Prevents posting torrents that are verified and categorized as porn
                        if(!tor['subcategory'].startsWith('5')) {
                            api.torrent.postTorrent(tor, function(){
                                //done
                            });
                        }
                    }
                });
            }
        }).catch(function(err){
            client.log(err);
        });
    }
    else if(action === 'best') {
        tpb.search('', {
            category: '0',
            page: page,
            orderBy: '7'
        })
        .then(function(results){
            for(var i = 0; i < results.length; i++) {
                let tor = new api.torrent.Torrent({
                    name: results[i]['name'],
                    magnetLink: results[i]['magnetLink'],
                    subcategory: results[i]['subcategory']['id']
                });
                api.torrent.locallyValidateTorrent(tor, function(status) {
                    if(status === 'success') {
                        //Prevents posting torrents that are verified and categorized as porn
                        if(!tor['subcategory'].startsWith('5')) {
                            api.torrent.postTorrent(tor, function(){
                                //done
                            });
                        }
                    }
                });
            }
            page++;
            if(results.length !== 0) {
                recur('best');
            }
            else {
                client.warn('Can\'t find anymore torrents after page ', page, '. Stopping.')
            }
        }).catch(function(err){
            client.log(err);
        });
    }
};
