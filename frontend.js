var urbanmusic = {
    addToList: function addToList(data,list){
       console.log("add to list");
       for (var i=0;i<data.length;i++){
           list.append("<li>"+data[i]+"</li>");   
       }
       list.val(data[0]);
    },
    doload: function(){
        
    	YUI().use('scrollview', function(Y) {
        var scrollView = new Y.ScrollView({
            id:"scrollview",
            srcNode: '#scrollview-yearcontent',
       	    width: 200,
            flick: {
                   minDistance:10,
                   minVelocity:0.3,
                   axis: "x"
               }
           }); 
           scrollView.render();
       
       
           scrollView.on("scrollEnd",function(event){
               var ev = event.originalEvent;
               console.log("FIRED");
           });
           
       
           var scrollView = new Y.ScrollView({
               id:"scrollview",
               srcNode: '#scrollview-genrecontent',
               width: 200,
               flick: {
                   minDistance:10,
                   minVelocity:0.3,
                   axis: "x"
               }
           });
           scrollView.render();
       
           var scrollView = new Y.ScrollView({
               id:"scrollview",
               srcNode: '#scrollview-popcontent',
               width: 200,
               flick: {
                   minDistance:10,
                   minVelocity:0.3,
                   axis: "x"
               }
           });
           scrollView.render();
       
        });
        console.log("doload");
        $.ajax({
          url: "years.json",
          dataType: "json",
          success: function(data){
            var list = $("#year-list");
            urbanmusic.addToList(data,list);
          }
        });
        
        $.ajax({
          url: "genre.json",
          dataType: "json",
          success: function(data){
            var list = $("#genre-list");
            urbanmusic.addToList(data,list);
          }
        });
      
	$.ajax({
          url: "pop.json",
          dataType: "json",
          success: function(data){
            var list = $("#pop-list");
            urbanmusic.addToList(data,list);
          }
        });

  
        $(".listen-button").bind("touch click",
            urbanmusic.listen);
        $(".listen-button").bind("touch click",
            urbanmusic.randomize);
            
        setTimeout(function(){
            if ($.mobile.activePage.attr("id")!="randomize")
                $.mobile.changePage("randomize");
        },0);
    },
    /*
        set random arbitrary values 
    */
    randomize: function(){
          
    },
    /*
        send selected values
        load new page
    */
    listen: function(){
        var data = {};
        data.genre = $("#genre-list").val();
        data.years = $("#year-list").val();
	    data.pop = $("#pop-list").val();
        
        $.mobile.pageLoading();
        $.ajax({
          url: "listen",
          data: data,
          dataType: "json",
          success: function(data){
        		console.log("returned");
        		console.log(data.artist);
        		console.log(data.track);
        		console.log(data.img);
        		console.log(data.audio);
            	$.mobile.changePage("listen");
        		$(".artist-title").html(data.artist);
        		$(".track-title").html(data.track);
        		$(".image-title").html("<img src="+data.img+"></img>");	
        		$(".audio-title").html('<audio id="audio-ele" src="'+data.audio+"&.mp3"+'" controls="controls" autoplay></audio>');
        		setTimeout(function(){
        		  document.getElementById("audio-ele").play();
        		},100);
        		setTimeout(function(){
        		  document.getElementById("audio-ele").play();
        		},3000);
        		$.mobile.pageLoading(true);
          },
          error: function(){
            
          }
        }); 
    }
}





console.log("frontend.js");
window.addEventListener("load",urbanmusic.doload,false);
