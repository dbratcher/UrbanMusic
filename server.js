var sys = require("sys"),
    http = require("http"),
    url = require("url"),
    path = require("path"),
    fs = require("fs"),
    qs = require("querystring"),
    playlist = require("./playlist"),
    libxml = require("libxmljs"),
    xhr = require("./XMLHTTPRequest.js");;

//grooveshark.groove.getMP3("lady gaga");
//playlist.playlist.search("lady");



http.createServer(function(request, response) {
    var urlstub = request.url;
    if (urlstub=="/")
        urlstub = "index.html";
    console.log("urlstub: "+urlstub);
    var uri = url.parse(urlstub).pathname;
    console.log("uri: "+uri);
    if(uri=="/listen"){
      	var query=qs.parse(urlstub.substring(uri.length+1));
      	console.log("Handling listen stuff");
      	var data = {};
      	data.method = "tag.gettoptracks"
      	data.tag = query.genre;
      	data.api_key="d68be9970d20265eaad5ef4c92b21fcc";
      	var post_data=qs.stringify(data);
      	var req=new xhr.XMLHttpRequest();
      	req.open("GET","http://ws.audioscrobbler.com/2.0/?"+post_data);
      	console.log(post_data);
      	req.setRequestHeader('Content-Type', "application/x-www-form-urlencoded");
      	console.log("here");
      	req.onreadystatechange = function(ev){
      		try{
      			if (req.readyState==4 && req.status == 200){	
      				var xml = req.responseText;
      				//console.log("xml: "+xml);
      				var xml_doc=libxml.parseXmlString(xml);
      				var track="",artist="",img="";
      				try{
      				track=xml_doc.root().childNodes()[1].childNodes()[1].childNodes()[1].text();
      				}catch(e){console.log("trackerr");}
      				console.log(track);
      				try{
      				artist=xml_doc.root().childNodes()[1].childNodes()[1].
      				      childNodes()[11].childNodes()[1].text();
      				}catch(e){console.log("artist");}
      				console.log(artist);
      				try{
      				img=xml_doc.root().childNodes()[1].childNodes()[1].childNodes()[19].text();
      				}catch(e){console.log("img");}
      				console.log(img);
      				console.log(track+" by "+artist+" with image:"+img);
      				
      				playlist.playlist.getMP3(track+" "+artist, function(url){
                        var data={};
        				data.track=track;
        				data.artist=artist;
        				data.img=img;
        				data.audio=url;
        				response.writeHead(200,{"Content-Type":"application/json"});
        				response.write(JSON.stringify(data));
        				response.end();
        				console.log("returning");
                    });
      				
      				
      				return;
      			}
      		}
      		catch(e)
      		{
      			console.log(e);
      		}
      	}
      	req.send(post_data);

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
