var sys = require("sys"),
    http = require("http"),
    url = require("url"),
    path = require("path"),
    fs = require("fs");

http.createServer(function(request, response) {
    var urlstub = request.url;
    if (urlstub=="/")
        urlstub = "index.html";
    
    console.log("urlstub: "+urlstub);
    var uri = url.parse(urlstub).pathname;
    console.log("uri: "+uri);
    
    
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
    		    if (filename.match(/\.js$/)){
    		      contenttype = "application/javascript"; 
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
}).listen(8080);

sys.puts("Server running at http://localhost:8080/");
