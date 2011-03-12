var uuidsvc = require("./uuid");
require("joose");
require("joosex-namespace-depended");
require("hash");
var xhr = require("./XMLHTTPRequest.js");


var grooveshark = {
  clientRevision:"20101012.03",
  session:"",//"9eb808b493d6022e0e2a2e1355011ec1",
  uuid:"",//"E99C3E45-39A9-D6ED-559F-C0C4EF53F446",
  tries:0,
  currentToken:"",
  init: function(){
    //Get UUID for client
    
    var uuid = uuidsvc.generate();
    var uuidString = uuid.toString();
    grooveshark.uuid = uuidString;
    dump("grooveshark uuid: "+uuidString+"\n");
    
    var cookie = false;
    if (cookie){
      var vals = cookie.split(/; */);
      for (var i in vals){
         var kvp = vals[i];
         var pair = kvp.split('=');
         if (pair[0]=='PHPSESSID'){
             grooveshark.session = pair[1];
             break;
         }
      }
    }

//    console.log(xhr);
    var req=new xhr.XMLHttpRequest(); 
    req.open("GET","https://listen.grooveshark.com/"); 
    
    //Get Session ID
    req.onreadystatechange = function(ev){
      try{
        if (req.readyState==4 && req.status == 200){
           console.log("session stuff");
           try{
           var vals = req.getResponseHeader("Set-Cookie")
           console.log("vals: "+vals);
           if (vals){
              vals = vals.split(/; */);
              for (var i in vals){
                 var kvp = vals[i];
                 console.log("kvp: "+kvp);
                 var pair = kvp.split('=');
                 dump("pair: "+pair);
                 if (pair[0]=='PHPSESSID'){
                     grooveshark.session = pair[1];
                     console.log("session: "+grooveshark.session);
                     break;
                 }
              }
           } else {
              grooveshark.session = "7177bdaca3be9a662da1f3ba890e7419";
           }
           }catch(e){
                console.log(e);
           }
        }
      }catch(e){}
    }
    
    req.send(null);
  },
  getMP3: function(search){
    this.getSearchResults(search, function(songinfo){
        console.log("getmp3 songinfo: ");
        console.log("artist: "+songinfo);
        console.log("name: "+songinfo.name);
        console.log("album: "+songinfo.album);
        console.log("id: "+songinfo.id);
    });
  },
  //root.childrens[0].children[0].children[0].children[0].text()
  getTinySongResults: function(search, songcallback){
    debug("[tiny] token: "+this.currentToken+" tries: "+this.tries+"|"+this.tries);
    if (this.currentToken==""&&this.tries<5){
      this.getCommunicationToken(this.getTinySongResults,search,songcallback);
      this.tries++;
      return;
    }
    debug("[tiny] search: "+search);
    
    //search=search.replace('%22',"");
    var post = "q[]="+search+"&q[]=0";
    var req=new xhr.XMLHttpRequest();
    req.open("POST","http://tinysong.com/?s=s");
    req.setRequestHeader('Content-Type', "application/x-www-form-urlencoded");
    
    var gs = this;
    req.onreadystatechange = function(ev){
      try{
        if (req.readyState==4 && req.status==200){
          var text = req.responseText;
          console.log("text: "+text);
          var obj = JSON.parse(text);
          var offset = obj.extraParams.offset;
          console.log(obj.hostname);
          var response = JSON.parse(obj.hostname.resp.raw);
          var songs = response.result.songs;
          //print(songs[0].SongName);
          for (var i in songs){
            var res = songs[i]
            //var res = result[0];
            var songdata={};
            songdata.name=res["SongName"];
            songdata.artist=res["ArtistName"];
            songdata.id=res["SongID"];
            songdata.artistID=res["ArtistID"];
            songdata.album=res["AlbumName"];
            
            
            //debug("Song: "+res["SongName"]+" - "+res["ArtistName"]+" s-a "+
            //         res["SongID"]+"-"+res["ArtistID"]);
            songcallback.apply(gs,[songdata]);
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
    var gs = this;
    try{
    console.log("before postdata");
    
    var postdata = {
      "header":{
        "clientRevision":gs.clientRevision,
        "session":gs.session,
        "token":gs.computeToken("getSearchResultsEx",gs.currentToken),
        "client":"gslite",
        "country":{"CC3":"0","CC2":"0","ID":"223","CC1":"0","CC4":"1073741824"},
        "uuid":gs.uuid
      },
      "parameters":{
        "type":"Songs",
        "query":search//decodeURIComponent(search)
      },
      "method":"getSearchResultsEx"
    }
    console.log("after postdata obj");
    var post = JSON.stringify(postdata);
    var req=new xhr.XMLHttpRequest();
    req.open("POST","http://cowbell.grooveshark.com/more.php?getSearchResultsEx");
    req.setRequestHeader('Content-Type', "application/json");
    req.setRequestHeader('Cookie','PHPSESSID=7177bdaca3be9a662da1f3ba890e7419;');
    
    var hasloaded=false;

    req.onreadystatechange = function(ev){
      var status=-1;
      console.log("state change");
      try{status=req.status;}catch(e){}
      try{
        if (status==200&&!hasloaded){
          if (req.responseText&&req.responseText!=""){
            try{
              console.log("search returned");
              var obj=JSON.parse(req.responseText);
              //"fault":{"code":256,"message":" invalid token"}
              if (obj["fault"]){
                debug(obj["fault"]["code"]+") "+obj["fault"]["message"]);
                gs.currentToken="";
                gs.getCommunicationToken(gs.getSearchResults,search,songcallback);
                return;
              }
              var result=obj["result"]["result"];
              for (var i in result){
                var res = result[i];
                //var res = result[0];
                var songdata={};
                songdata.name=res["SongName"];
                songdata.artist=res["ArtistName"];
                songdata.id=res["SongID"];
                songdata.artistID=res["ArtistID"];
                songdata.album=res["AlbumName"];
                //debug("Song: "+res["SongName"]+" - "+res["ArtistName"]+" s-a "+
                //         res["SongID"]+"-"+res["ArtistID"]);
                songcallback.apply(gs,[songdata]);
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
    }catch(e){
        console.log(e);   
    }
  },
  getStreamKey: function(songid,callback){
    var parameters = this._getSongParameters(songid);
    dump("getStreamKey - "+songid+" param: "+parameters+"\n");
    function streamKeyCallback(text){
      dump("streamkeyresponse: "+text+"\n");
      var obj=JSON.parse(text);
      
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
    var gs = this;
    dump("getCommunicatoin Token: "+gs.tries+"\n");
    
    var req=new xhr.XMLHttpRequest();
    req.open("POST","https://cowbell.grooveshark.com/more.php");
    req.setRequestHeader('Content-Type', "application/json");
    debug("get communication token");
    req.setRequestHeader('Cookie',"PHPSESSID="+gs.session);
    var postdata={
      "header":
      {
        "uuid":gs.uuid,
        "privacy":0,
        "client":"gslite",
        "session": gs.session,
        "clientRevision":gs.clientRevision
      },
      "parameters":{
        "secretKey": doHash(gs.session,"MD5")
      },
      "method":"getCommunicationToken"
    }
    debug("postdata stuff");
    var post = JSON.stringify(postdata);
    debug("Post: "+post);
    var hasloaded=false;
    req.onreadystatechange = function(ev){
      var status=-1;
      try{status=req.status;}catch(e){}
      console.log(status);
      try{
        if (req.readyState==4 && status==200&&!hasloaded){
          if (req.responseText&&req.responseText!=""){
            debug("gct response: "+req.responseText);
            var obj=JSON.parse(req.responseText);
            var result=obj["result"];
            debug("result: "+result);
            if (result){
              gs.currentToken = result;
              gs.tries=0;
              callback.apply(gs,[arg1,arg2]);
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
    var post = JSON.parse(this._getPostData(method,parameters));
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
  if (htype=="MD5"){
     return Hash.md5(str); 
  } else {
     return Hash.sha1(str);
  }
}
function randChars(){
  var chars="1234567890abcdef";
  var s="";
  for (var i=0;i<6;i++){
    s+=chars.charAt(Math.floor(Math.random()*16));
  }
  return s;
}
function dump(str){
   console.log(str);   
}
function debug(str){
   console.log(str);   
}

exports.groove = grooveshark;

//exports.groove.init();

//exports.groove = "test";