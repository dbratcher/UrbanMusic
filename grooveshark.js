//0222a872de599249f6b4eb5ce58c9394
mp3sites["grooveshark"] = new MP3Site("http://grooveshark.com/#",
                                "%s",
                                "chrome://fullfiller/skin/grooveshark.ico",
                                "Grooveshark"
                                )
//mp3sites["grooveshark"].scanAction = window.mediaPage.lookupGrooveshark;
mp3sites["grooveshark"].scanAction = function lookupGrooveshark(search){
  var mediaList = window.mediaPage.webView.mediaList;
  //var metadataService = 
  //      Components.classes["@songbirdnest.com/Songbird/FileMetadataService;1"]
  //                .getService(Components.interfaces.sbIFileMetadataService);
  //var mediaItemsToScan = Cc["@songbirdnest.com/moz/xpcom/threadsafe-array;1"]
  //                         .createInstance(Ci.nsIMutableArray);
  
  grooveshark.getTinySongResults(search,function(songinfo){
    var properties = {};
    properties[SBProperties.enableAutoDownload] = "1";
    properties[SBProperties.downloadButton] = "1|0|0";
    properties[SBProperties.artistName] = songinfo.artist;
    properties[SBProperties.trackName] = songinfo.name;
    properties[SBProperties.albumName] = songinfo.album;
    properties[mp3sites["grooveshark"].ns+"songID"]=songinfo.id;
    properties[mp3sites["grooveshark"].ns+"streamKey"]=0;
    //debug(mp3sites["grooveshark"].ns+"streamKey");
    //debug("grooveshark: "+songinfo.name+" - "+songinfo.album+" - "+songinfo.artist+"\n");
    mediaItemsToScan = Cc["@songbirdnest.com/moz/xpcom/threadsafe-array;1"]
             .createInstance(Ci.nsIMutableArray);
    uri = "http://listen.grooveshark.com/more.php?music"+
                "&track="+encodeURIComponent(songinfo.name)+
                "&artist="+encodeURIComponent(songinfo.artist)+
                "&songid="+songinfo.id;
    //debug(uri);
    //debug("properties: "+properties);
    //debug(SBProperties.createArray(properties));
    try{
    var mediaItem = window.mediaPage._library.createMediaItem(newURI(uri),
                                      SBProperties.createArray(properties),false);
    mediaItem.setProperty(mp3sites["grooveshark"].ns+"songID",songinfo.id);
    mediaItem.setProperty(mp3sites["grooveshark"].ns+"streamKey",0);
    mediaItem.setProperty(mp3sites["grooveshark"].ns+"streamServer",0);
    //debug("meidaItem: "+mediaItem);
    mediaList.add(mediaItem);
    //debug("item added");
    }catch(e){
      debug("e: "+e);
    }
    //mediaItemsToScan.appendElement(mediaItem, false);
    //metadataService.read(mediaItemsToScan)
  });
}

mp3sites["grooveshark"].onItemClick = function(item){
  var ns = this.ns;
  var streamKey=item.getProperty(ns+"streamKey");
  //debug("streamKey: "+streamKey);
  //debug(ns+"streamKey");
  if (streamKey==0||streamKey==null){
    var songid = item.getProperty(ns+"songID");
    //debug("songID: "+songid);
    grooveshark.getStreamKey(songid,function(song){
      try{
        item.setProperty(ns+"streamKey",song.streamKey)
        item.setProperty(ns+"streamServer",song.streamServer);
        item.contentSrc = newURI(song.songURL);
        //debug("songURL: "+song.songURL);
      }catch(e){
        //debug("streamkeycallback: "+e);
      }
    });
  }
  return true;
}

grooveshark = {
  clientRevision:"20101012.03",
  session:"",//"9eb808b493d6022e0e2a2e1355011ec1",
  uuid:"",//"E99C3E45-39A9-D6ED-559F-C0C4EF53F446",
  tries:0,
  currentToken:"",
  init: function(){
    dump("grooveshark init\n");
    //Get UUID for client
    var uuidGenerator = 
      Components.classes["@mozilla.org/uuid-generator;1"]
                .getService(Components.interfaces.nsIUUIDGenerator);
    var uuid = uuidGenerator.generateUUID();
    var uuidString = uuid.toString();
    grooveshark.uuid = uuidString;
    dump("grooveshark uuid: "+uuidString+"\n");
    
    var ios = Components.classes["@mozilla.org/network/io-service;1"]
            .getService(Components.interfaces.nsIIOService);
    var uri = ios.newURI("http://listen.grooveshark.com/", null, null);
    var cookieSvc =
       Components.classes["@mozilla.org/cookieService;1"]
                 .getService(Components.interfaces.nsICookieService);
    var cookie = cookieSvc.getCookieString(uri, null);
    if (cookie){
      var vals = cookie.split(/; */);
      for each (var kvp in vals){
         var pair = kvp.split('=');
         if (pair[0]=='PHPSESSID'){
             grooveshark.session = pair[1];
             break;
         }
      }
    }

    var req=new XMLHttpRequest(); 
    req.open("GET","https://listen.grooveshark.com/"); 
    
    //Get Session ID
    req.onreadystatechange = function(ev){
      try{
        if (req.readyState==4 && req.status == 200){
           var vals = req.getResponseHeader("Set-Cookie").split(/; */);
           for each (var kvp in vals){
              var pair = kvp.split('=');
              dump("pair: "+pair);
              if (pair[0]=='PHPSESSID'){
                  grooveshark.session = pair[1];
                  break;
              }
           }
           
        }
      }catch(e){}
    }

    req.send(null);
  },
  getTinySongResults: function(search, songcallback){
    debug("[tiny] token: "+grooveshark.currentToken+" tries: "+this.tries+"|"+grooveshark.tries+"\n");
    if (this.currentToken==""&&this.tries<5){
      this.getCommunicationToken(this.getTinySongResults,search,songcallback);
      this.tries++;
      return;
    }
    debug("[tiny] search: "+search);
    
    //search=search.replace('%22',"");
    var post = "q[]="+search+"&q[]=0";
    var req=new XMLHttpRequest();
    req.open("POST","http://tinysong.com/?s=s");
    req.setRequestHeader('Content-Type', "application/x-www-form-urlencoded");
    
    req.onreadystatechange = function(ev){
      try{
        if (req.readyState==4 && req.status==200){
          var text = req.responseText;
          var obj = JSON.decode(text);
          var offset = obj.extraParams.offset;
          var response = JSON.decode(obj.hostname.resp.raw);
          var songs = response.result.songs;
          //print(songs[0].SongName);
          for each (var res in songs){
            //var res = result[0];
            var songdata={};
            songdata.name=res["SongName"];
            songdata.artist=res["ArtistName"];
            songdata.id=res["SongID"];
            songdata.artistID=res["ArtistID"];
            songdata.album=res["AlbumName"];
            //debug("Song: "+res["SongName"]+" - "+res["ArtistName"]+" s-a "+
            //         res["SongID"]+"-"+res["ArtistID"]);
            songcallback.apply(grooveshark,[songdata]);
          }
        }
       }catch(e){
         debug(e);
       }
    }
    
    req.send(post);
  },
  getSearchResults: function(search, songcallback){
    debug("token: "+this.currentToken+" tries: "+this.tries);
    if (this.currentToken==""&&this.tries<5){
      this.getCommunicationToken(this.getSearchResults,search,songcallback);
      this.tries++;
      return;
    }
    debug("search: "+search);
    var postdata = {
      "header":{
        "clientRevision":grooveshark.clientRevision,
        "session":grooveshark.session,
        "token":grooveshark.computeToken("getSearchResultsEx",grooveshark.currentToken),
        "client":"gslite",
        "country":{"CC3":"0","CC2":"0","ID":"223","CC1":"0","CC4":"1073741824"},
        "uuid":grooveshark.uuid
      },
      "parameters":{
        "type":"Songs",
        "query":decodeURIComponent(search)
      },
      "method":"getSearchResultsEx"
    }
    var post = JSON.encode(postdata);
    var req=new XMLHttpRequest();
    req.open("POST","http://cowbell.grooveshark.com/more.php?getSearchResultsEx");
    req.setRequestHeader('Content-Type', "application/json");
    
    var hasloaded=false;
    req.onreadystatechange = function(ev){
      var status=-1;
      try{status=req.status;}catch(e){}
      try{
        if (status==200&&!hasloaded){
          if (req.responseText&&req.responseText!=""){
            try{
              var obj=JSON.decode(req.responseText);
              //"fault":{"code":256,"message":" invalid token"}
              if (obj["fault"]){
                debug(obj["fault"]["code"]+") "+obj["fault"]["message"]);
                grooveshark.currentToken="";
                grooveshark.getCommunicationToken(grooveshark.getSearchResults,search,songcallback);
                return;
              }
              var result=obj["result"]["result"];
              for each (var res in result){
                //var res = result[0];
                var songdata={};
                songdata.name=res["SongName"];
                songdata.artist=res["ArtistName"];
                songdata.id=res["SongID"];
                songdata.artistID=res["ArtistID"];
                songdata.album=res["AlbumName"];
                //debug("Song: "+res["SongName"]+" - "+res["ArtistName"]+" s-a "+
                //         res["SongID"]+"-"+res["ArtistID"]);
                songcallback.apply(grooveshark,[songdata]);
              }
              hasloaded=true;
              //getStreamKey(res["SongID"],playSong);
            }catch(e){
              //debug(e);
            }
          }
        }
      }catch(e){debug(e)}
    }
    req.send(post);
  },
  getStreamKey: function(songid,callback){
    var parameters = this._getSongParameters(songid);
    dump("getStreamKey - "+songid+" param: "+parameters+"\n");
    function streamKeyCallback(text){
      dump("streamkeyresponse: "+text+"\n");
      var obj=JSON.decode(text);
      
      if ("fault" in obj){
        //"fault":{"code":256,"message":" invalid token"}
        var fault=obj["fault"];
        dump("getStreamKey fault: "+fault.code+" "+fault.message+"\n");
        
        grooveshark.currentToken="";
        dump("grooveshark tries: "+grooveshark.tries+"\n");
        if (grooveshark.tries<5){
          grooveshark.getCommunicationToken(grooveshark.getStreamKey,songid,callback);
          grooveshark.tries++;
        }
      } else {
        var result=obj["result"];
        if (!result["streamKey"]){
          debug("streamKeyError: "+text);
        }
        var song=new GrooveSong(songid,result["FileToken"],result["streamKey"],result["streamServerID"],result["ip"]);
        callback.apply(grooveshark,[song]);
      }
    }
    
    this._sendPost("getStreamKeyFromSongIDEx",parameters,streamKeyCallback);
  },
  markSongDownloaded: function(serverID,songID,streamKey){
    var parameters = {
      "streamServerID":serverID,
      "songID":songID,
      "streamKey":streamKey
    }
    this._sendPost("markSongDownloadedEx",parameters,function(){});
  },
  getCommunicationToken: function(callback,arg1,arg2){
    dump("getCommunicatoin Token: "+grooveshark.tries+"\n");
    var req=new XMLHttpRequest();
    req.open("POST","https://cowbell.grooveshark.com/more.php");
    req.setRequestHeader('Content-Type', "application/json");
    debug("get communication token");
    req.setRequestHeader('Cookie',"PHPSESSID="+grooveshark.session);
    /*
     {"header":{"
     privacy":0,
     "uuid":"333541AA-EC2B-7C92-7C56-C0B6E4FDABAE",
     "client":"gslite",
     "session":"9eb808b493d6022e0e2a2e1355011ec1",
     "clientRevision":"20101012.03"},
     "parameters":{"secretKey":"40bffc83262a5a7614146847c97675c4"},
     "method":"getCommunicationToken"}
     
    */
    var postdata={
      "header":
      {
        "uuid":grooveshark.uuid,
        "privacy":0,
        "client":"gslite",
        "session": grooveshark.session,
        "clientRevision":grooveshark.clientRevision
      },
      "parameters":{
        "secretKey": doHash(grooveshark.session,"MD5")
      },
      "method":"getCommunicationToken"
    }
    var post = JSON.encode(postdata);
    debug("Post: "+post);
    var hasloaded=false;
    req.onreadystatechange = function(ev){
      var status=-1;
      try{status=req.status;}catch(e){}
      try{
        if (req.readyState==4 && status==200&&!hasloaded){
          if (req.responseText&&req.responseText!=""){
            debug("gct response: "+req.responseText);
            var obj=JSON.decode(req.responseText);
            var result=obj["result"];
            debug("result: "+result);
            if (result){
              grooveshark.currentToken = result;
              grooveshark.tries=0;
              callback.apply(grooveshark,[arg1,arg2]);
              hasloaded=true;
            }
          }
        }
      }catch(e){}
    }
    req.send(post);
  },
  _getSongParameters: function(songid){
    return {
            "songID":songid,
            "country":{
              "ID":"223", "IPR":"132","CC4":"1073741824",
              "CC3":"0","CC2":"0","CC1":"0"
            },
            "mobile":false,
            "prefetch":false
           };
  },
  _getPostData: function(method,parameters){
    var postdata={
      "header":
      {
        "session":grooveshark.session,
        "token":grooveshark.computeToken(method,grooveshark.currentToken),
        "uuid":grooveshark.uuid,
        "clientRevision":grooveshark.clientRevision,
        "client":"gslite",
        "country":{//"ID":"223","IPR":"132","CC4":"1073741824","CC3":"0","CC2":"0","CC1":"0"
          "ID":"223", "IPR":"132","CC4":"1073741824",
          "CC3":"0","CC2":"0","CC1":"0"
        }
      },
      "method":method
    }
    if (parameters)
      postdata["parameters"]=parameters;
    return postdata;
  },
  _sendPost: function(method,parameters,callback,service){
    var post = JSON.encode(this._getPostData(method,parameters));
    var req=new XMLHttpRequest();
    if (!service)
      service="more";
    debug("send: http://cowbell.grooveshark.com/"+service+".php?"+method);
    req.open("POST","http://cowbell.grooveshark.com/"+service+".php?"+method);
    req.setRequestHeader('Content-Type', "application/json");
    req.setRequestHeader('Cookie',"PHPSESSID="+grooveshark.session);
    
    var hasloaded=false;
    req.onreadystatechange = function(ev){
      var status=-1;
      try{status=req.status;}catch(e){}
      try{
        if (status==200&&!hasloaded){
          try{
            callback.apply(grooveshark,[req.responseText]);
            hasloaded=true;
          }catch(e){}
        }
      }catch(e){}
    }
    req.send(post);
  },
  /*
   token = randchars+sha1(method:secretToken:quitStealinMahShit:randchars)
  */
  computeToken: function(method,secrettoken){
    var rand=randChars();
    var loc4 = method+":"+secrettoken+":quitStealinMahShit:"+rand;
    debug(loc4);
    loc4=rand+doHash(loc4,"SHA1");
    return loc4;
  }
}

function GrooveSong(songID,fileToken,streamKey,streamServer,ip){
  this.songID = songID;
  this.fileToken = fileToken;
  this.streamKey = streamKey;
  this.streamServer = streamServer;
  this.ip = ip;
}
GrooveSong.prototype.__defineGetter__("songURL", function() {
  return "http://"+this.ip+"/stream.php?streamKey="+this.streamKey;  
});
function doHash(str,htype){
  var converter =
    Components.classes["@mozilla.org/intl/scriptableunicodeconverter"].
      createInstance(Components.interfaces.nsIScriptableUnicodeConverter);
  
  // we use UTF-8 here, you can choose other encodings.
  converter.charset = "UTF-8";
  // result is an out parameter,
  // result.value will contain the array length
  var result = {};
  // data is an array of bytes
  var data = converter.convertToByteArray(str, result);
  var ch = Components.classes["@mozilla.org/security/hash;1"]
                     .createInstance(Components.interfaces.nsICryptoHash);
  if (htype=="MD5")
    ch.init(ch.MD5);
  else
    ch.init(ch.SHA1);
  ch.update(data, data.length);
  var hash = ch.finish(false);
  
  // return the two-digit hexadecimal code for a byte
  function toHexString(charCode)
  {
    return ("0" + charCode.toString(16)).slice(-2);
  }
  
  // convert the binary hash data to a hex string.
  var s = [toHexString(hash.charCodeAt(i)) for (i in hash)].join("");
  return s;
}
function randChars(){
  var chars="1234567890abcdef";
  var s="";
  for (var i=0;i<6;i++){
    s+=chars.charAt(Math.floor(Math.random()*16));
  }
  return s;
}

grooveshark.init();

/*
 Notes:
 
*/