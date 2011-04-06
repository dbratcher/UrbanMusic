var qs = require("querystring"),
    libxml = require("libxmljs"),
    sys = require("sys"),
    path = require("path"),
    fs = require("fs")
    xhr = require("./XMLHTTPRequest.js");
    
var lastfm = {
    apikey: "d68be9970d20265eaad5ef4c92b21fcc",
    url: "http://ws.audioscrobbler.com/2.0/?",
    perpage: 50,
    datainfo: {
        tag: {
            disco: {
                total: 1000
            }   
        }
    },
    
    requestURL: function(data,callback){
        var req=new xhr.XMLHttpRequest();
      	req.open("GET",this.url+qs.stringify(data));
      	req.setRequestHeader('Content-Type', "application/x-www-form-urlencoded");
      	var lfm = this;
      	req.onreadystatechange = function(ev){
      		try{
      			if (req.readyState==4 && req.status == 200){	
      				var xml = req.responseText;
      				
      				lfm.handleXML(xml,function(songinfo){
      				  if (!lfm.datainfo.tag[data.tag])
      				      lfm.datainfo.tag[data.tag] = {total: 1};
      				  lfm.datainfo.tag[data.tag].total = songinfo.total;
      				  delete songinfo.total;  
      				  console.log("total for "+data.tag+" is "+lfm.datainfo.tag[data.tag].total);
      				  songinfo.index = songinfo.index+lfm.perpage*data.page;
                      callback(songinfo);
      				});
      				
      				var filename = path.join(process.cwd(), "lastfm");
      				path.exists(filename,function(exists){
      				    if (!exists)
      				      fs.mkdirSync(filename);
      				    filename = lfm.getXMLPath(data);
          				setTimeout(function(){
          				  fs.writeFile(filename, xml, function (err) {
                            if (err) throw err;
                            console.log('It\'s saved!');
                          });
          				},0);      			
      				});
      			}
      		}
      		catch(e)
      		{
      			console.log(e);
      		}
      	}
      	req.send();   
    },
    readFromFile: function(path,data, callback){
        var lfm = this;
        fs.readFile(path, function(err, txtdata){
            if (err) {
              console.log("error reading local xml file");
              lfm.requestURL(data,callback);
            } else {
              console.log("read from file!");
              lfm.handleXML(""+txtdata,function(songinfo){
                  if (!lfm.datainfo.tag[data.tag])
                      lfm.datainfo.tag[data.tag] = {total: 1};
                  lfm.datainfo.tag[data.tag].total = songinfo.total;
                  delete songinfo.total;  
                  console.log("total for "+data.tag+" is "+
                          lfm.datainfo.tag[data.tag].total);
                  songinfo.index = songinfo.index+lfm.perpage*data.page;
                  callback(songinfo);
              });
            }
        });
    },  
    handleXML: function(xml,callback){
        var xml_doc=libxml.parseXmlString(xml);
      	var track="",artist="",img="";
      	try{
      	var rand=Math.round(Math.random()*(xml_doc.root().childNodes()[1].
      	      childNodes().length/2));
      	console.log(rand);
      	var total = xml_doc.root().childNodes()[1].attr("total").value();

      	console.log("total tracks: "+total);
        
        
      	track=xml_doc.root().childNodes()[1].childNodes()[1+rand*2].childNodes()[1].text();
      	}catch(e){console.log("trackerr: "+e);}
      	console.log(track);
      	try{
      	artist=xml_doc.root().childNodes()[1].childNodes()[1+rand*2].
      	      childNodes()[11].childNodes()[1].text();
      	}catch(e){console.log("artist");}
      	console.log(artist);
      	try{
      	img=xml_doc.root().childNodes()[1].childNodes()[1+rand*2].childNodes()[19].text();
      	}catch(e){console.log("img");}
      	console.log(img);
      	console.log(track+" by "+artist+" with image:"+img);
      	
      	var sinfo = {
      	  track: track,
      	  artist: artist,
      	  img: img,
          index: rand,
          total: total
      	}
      	callback(sinfo);
    },
    findSong: function(query,callback){
        var data = {};
      	data.method = "tag.gettoptracks"
      	data.tag = query.genre;
      	data.api_key=this.apikey;
      	if (this.datainfo.tag[data.tag]){
      	    var pages = Math.ceil(this.datainfo.tag[data.tag].total/this.perpage); 
            pages=pages>2?2:pages;
      	    data.page = Math.floor(Math.random()*pages);
      	    console.log("page: "+data.page +" / "+pages);
      	} else {
      	    data.page=0;
      	}
      	var lfm = this;
      	var xmlpath = this.getXMLPath(data);
      	console.log("xmlpath: "+xmlpath);
        path.exists(xmlpath,function(exists){
            console.log("xmlpath exists? :"+exists);
            if (exists){
                lfm.readFromFile(xmlpath, data, callback);
            } else {
                lfm.requestURL(data, callback);
            }
        });
      	
      	
    },
    getXMLPath: function(data){
        return path.join(process.cwd(),"lastfm/"+
      	     qs.stringify({method: data.method, tag: data.tag, page: data.page})+".xml");
    }
    
}

exports.service = lastfm;