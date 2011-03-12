var sys = require("sys"),
    http = require("http"),
    url = require("url"),
    path = require("path"),
    fs = require("fs"),
    qs = require("querystring"),
    grooveshark = require("./grooveshark");

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
	
	$.ajax({
		url: "http://ws.audioscrobbler.com/2.0/",
		data: data,
		dataType: "json",
		success: function(data){
			console.log(data);
		},
		error: function(){
		}
	});
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
            console.log(file);
    		response.writeHead(200, {"Content-Type": contenttype});
    		response.write(file, "binary");
    		response.end();
    	});
    });
}
}).listen(8080);

sys.puts("Server running at http://localhost:8080/");
