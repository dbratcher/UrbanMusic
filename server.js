var sys = require("sys"),
    http = require("http"),
    url = require("url"),
    path = require("path"),
    fs = require("fs"),
    qs = require("querystring"),
    playlist = require("./playlist"),
    libxml = require("libxmljs"),
    lastfm = require("./lastfm"),
    xhr = require("./XMLHTTPRequest.js"),
    grooveshark = require("./grooveshark.js");
    
grooveshark.groove.init();
setTimeout(function(){
        grooveshark.groove.getCommunicationToken(function(){
           console.log("found com token: "+grooveshark.groove.currentToken); 
           grooveshark.groove.getMP3("lady gaga pokerface", function(url){
              console.log("url: "+url);
           });
        });
},1000);
//grooveshark.groove.getMP3("lady gaga");
//playlist.playlist.search("lady");

function handleListen(response,query){
    
	console.log("Handling listen stuff");
	
	lastfm.service.findSong(query,function(songinfo){
	   console.log("lastfm returned: "+songinfo.track+" - "+songinfo.artist);
	     

	   playlist.playlist.getMP3(songinfo.track+" "+songinfo.artist, function(url){
	       songinfo.audio = url;
	       if (url){
    	       response.writeHead(200,{"Content-Type":"application/json"});
    	       response.write(JSON.stringify(songinfo));
    	       response.end();
	       } else {
	           	 grooveshark.groove.getMP3(songinfo.track+" "+songinfo.artist, function(song){
                    console.log("Gurl: "+song.songURL);
                    songinfo.audio = song.songURL;
                    response.writeHead(200,{"Content-Type":"application/json"});
                    response.write(JSON.stringify(songinfo));
                    response.end();
                    setTimeout(function(){
                        grooveshark.groove.markSongDownloaded(song.streamServer,song.id,song.streamKey);
                    },3000);
                });       
	       }
	   }); 
	});
}

http.createServer(function(request, response) {
    var urlstub = request.url;
    if (urlstub=="/")
        urlstub = "index.html";
    console.log("urlstub: "+urlstub);
    var uri = url.parse(urlstub).pathname;
    console.log("uri: "+uri);
    if(uri=="/listen"){
      	handleListen(response, qs.parse(urlstub.substring(uri.length+1)));
    }
    else{
    
    var filename = path.join(process.cwd(), uri);

    path.exists(filename, function(exists) {
    	if(!exists) {
    	    console.log("doesn't exist");
    		response.writeHead(404, {"Content-Type": "text/plain"});
    		response.write("404 Not Found");
    		response.end();
    		return;
    	}


    	fs.readFile(filename, "binary", function(err, file) {
      	    console.log("file exists");
		if(filename.match(/\.html$/)){
			contenttype = "text/html";
		}
	    if (filename.match(/\.js$/)){
	      contenttype = "application/javascript"; 
	    }
	    if (filename.match(/\.css$/)){
			contenttype = "text/css";
		} else if (filename.match(/\.jpg$/)){
		    contenttype = "image/jpeg"; 
		}
    		if(err) {
    		    console.log("err sending file");
    		    var contenttype = "text/plain";
    			response.writeHead(500, {"Content-Type": contenttype});
    			response.write("filename: "+filename+"\n");
    			response.write(err + "\n");
    			response.end();
    			return;
    		}
            console.log("sent file: ");
            //console.log(file);
    		response.writeHead(200, {"Content-Type": contenttype});
    		response.write(file, "binary");
    		response.end();
    	});
    });
}
}).listen(8080);

sys.puts("Server running at http://localhost:8080/");
