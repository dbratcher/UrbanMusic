var xhr = require("./XMLHTTPRequest.js");
var querystring = require("querystring");
/* RC4 symmetric cipher encryption/decryption
 * Copyright (c) 2006 by Ali Farhadi.
 * released under the terms of the Gnu Public License.
 * see the GPL for details.
 *
 * Email: ali[at]farhadi[dot]ir
 * Website: http://farhadi.ir/
 */

/**
 * Encrypt given plain text using the key with RC4 algorithm.
 * All parameters and return value are in binary format.
 *
 * @param string key - secret key for encryption
 * @param string pt - plain text to be encrypted
 * @return string
 */
function rc4Encrypt(key, pt) {
	s = new Array();
	for (var i=0; i<256; i++) {
		s[i] = i;
	}
	var j = 0;
	var x;
	for (i=0; i<256; i++) {
		j = (j + s[i] + key.charCodeAt(i % key.length)) % 256;
		x = s[i];
		s[i] = s[j];
		s[j] = x;
	}
	i = 0;
	j = 0;
	var ct = '';
	for (var y=0; y<pt.length; y++) {
		i = (i + 1) % 256;
		j = (j + s[i]) % 256;
		x = s[i];
		s[i] = s[j];
		s[j] = x;
		ct += String.fromCharCode(pt.charCodeAt(y) ^ s[(s[i] + s[j]) % 256]);
	}
	return ct;
}

/**
 * Decrypt given cipher text using the key with RC4 algorithm.
 * All parameters and return value are in binary format.
 *
 * @param string key - secret key for decryption
 * @param string ct - cipher text to be decrypted
 * @return string
*/
function rc4Decrypt(key, ct) {
	return rc4Encrypt(key, ct);
}

function strToChars(str){
  var loc1=new Array();
  var loc2=0;
  while(loc2<str.length){
    loc1.push(str.charCodeAt(loc2));
    loc2=loc2+1;
  }
  return loc1;
}

function hexToChars(str){
  var arr=new Array();
  var loc2=str.substr(0,2)!="0x" ? 0 : 2;
  while(loc2<str.length){
    arr.push(parseInt(str.substr(loc2,2),16));
    loc2=loc2+2;
  }
  return arr;
}

var rc4Key="sdf883jsdf22";
function decrypt(key,url){
  return rc4Decrypt(rc4Key,hexToChars(url).map(function(s){return String.fromCharCode(s);}).join(""))
}

var playlist = {
    rc4Key:"sdf883jsdf22",
    url: "http://www.playlist.com/async/searchbeta/tracks?searchfor=%s&page=%page",
    search: function(txt, callback){
        var url = this.url.replace(querystring.escape("%s"),txt);
        url = url.replace("%page",0);
        console.log("url: "+url);
        var req=new xhr.XMLHttpRequest();
        req.open('GET',url,true);
        var pl = this;
        req.onreadystatechange=function(){
            if (req.readyState==4&&req.status==200){
                var txt=req.responseText;
                var tracksText = txt.match(/PPL.search.trackdata = (.+);/m)[1];
                var tracks = JSON.parse(tracksText);
                for  (var i in tracks){
                    var track = tracks[i];
                    var songurl=track.song_url;
                    console.log("artist: "+track.artist);
                    console.log("title: "+track.title);
                    console.log("album: "+track.album);
                    //console.log("url: "+songurl);
                    var uri=decrypt(pl.rc4Key,songurl);
                    //var uri = rc4(pl.rc4Key,songurl);
                    console.log("uri: "+uri);
                    var song = {
                       title: track.title,
                       artist: track.artist,
                       album: track.album,
                       url: uri   
                    };
                    callback.apply(pl, [song]);
                    return;
                }
            } else if (req.readyState==4){
                console.log("req: "+req.responseText);   
            }
            //console.log(req.responseText);
        }
        req.send(null);
    },
    getMP3: function(search, callback){
       var pl = this;
       this.search(search, function(song){
            callback.apply(pl, [song.url]);
       }); 
    }
}

exports.playlist = playlist;