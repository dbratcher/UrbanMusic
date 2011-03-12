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
        },
        bounce:1
        });
    scrollView.render();


    scrollView.on("scrollXChange",function(event){
    	setTimeout(function(){
        var ev = event.originalEvent;
    	var value=event.newVal;
    	var main_x=$("#year-list").offset().left+120;
		$("#year-list").children().each(function(index, ele){
			var x = $(this).offset().left;
			var width = $(this).width();
			if((value > x-main_x)&&(value<(x-main_x+width))){
				console.log($(this).html());
				$("#year-list").val($(this).html());
			}
		});
		$("#scrollview-yearcontent").val(value);
		},500);
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

    scrollView.on("scrollXChange",function(event){
    	setTimeout(function(){
        var ev = event.originalEvent;
    	var value=event.newVal;
    	var main_x=$("#genre-list").offset().left+120;
		$("#genre-list").children().each(function(index, ele){
			var x = $(this).offset().left;
			var width = $(this).width();
			if((value > x-main_x)&&(value<(x-main_x+width))){
				console.log($(this).html());
				$("#genre-list").val($(this).html());
			}
		});
		$("#scrollview-genrecontent").val(value);
		},500);
    });
    
    
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


    scrollView.on("scrollXChange",function(event){
    	setTimeout(function(){
        var ev = event.originalEvent;
    	var value=event.newVal;
    	var main_x=$("#pop-list").offset().left+120;
		$("#pop-list").children().each(function(index, ele){
			var x = $(this).offset().left;
			var width = $(this).width();
			if((value > x-main_x)&&(value<(x-main_x+width))){
				console.log($(this).html());
				$("#pop-list").val($(this).html());
			}
		});
		$("#scrollview-popcontent").val(value);
		},500);
    });


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
          },
          error: function(){
            
          }
        }); 
    }
}





console.log("frontend.js");
window.addEventListener("load",urbanmusic.doload,false);
