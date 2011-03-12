var urbanmusic = {
    years: [],
    genre: [],
    pop: [],
    yearscroll: null,
    genrescroll: null,
    popscroll: null,
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
            id:"years-scrollview",
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
        urbanmusic.yearscroll = scrollView;
    
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
        
    
        scrollView = new Y.ScrollView({
            id:"genre-scrollview",
            srcNode: '#scrollview-genrecontent',
            width: 200,
            flick: {
                minDistance:10,
                minVelocity:0.3,
                axis: "x"
            }
        });
        scrollView.render();
        urbanmusic.genrescroll = scrollView;
        
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
        
        
        scrollView = new Y.ScrollView({
            id:"pop-scrollview",
            srcNode: '#scrollview-popcontent',
            width: 200,
            flick: {
                minDistance:10,
                minVelocity:0.3,
                axis: "x"
            }
        });
        scrollView.render();
        urbanmusic.popscroll = scrollView;
    
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
            urbanmusic.years = data;
          }
        });
        
        $.ajax({
          url: "genre.json",
          dataType: "json",
          success: function(data){
            var list = $("#genre-list");
            urbanmusic.addToList(data,list);
            urbanmusic.genre = data;
          }
        });
      
	   $.ajax({
          url: "pop.json",
          dataType: "json",
          success: function(data){
            var list = $("#pop-list");
            urbanmusic.addToList(data,list);
            urbanmusic.pop = data;
          }
        });

  
        $(".listen-button").bind("touch click",
            urbanmusic.listen);
        $(".listen-button").bind("touch click",
            urbanmusic.randomize);
        
        $(".back-button").bind("click",function(){
           $.mobile.changePage("randomize"); 
        });
        $(".next-button").bind("click",function(){
           urbanmusic.listen();
        });
        $(".randomize-button").bind("click",function(){
           urbanmusic.randomize();   
        });
        setTimeout(function(){
            if ($.mobile.activePage.attr("id")!="randomize")
                $.mobile.changePage("randomize");
        },0);
    },
    /*
        set random arbitrary values 
    */
    randomize: function(){
        try{
        var val = this.years[Math.floor(Math.random()*this.years.length)];
        console.log("val: "+val);
        $("#year-list").val(val);
        $("#year-list").children().each(function(idx){
           if ($(this).html()==val){
              console.log("yearscroll: "+urbanmusic.yearscroll);
              urbanmusic.yearscroll.scrollTo($(this).offset().left
                -$("#year-scrollview"),0);
              return false;
           } 
        });
        
        val = this.genre[Math.floor(Math.random()*this.genre.length)];
        $("#genre-list").val(val);
        $("#genre-list").children().each(function(idx){
           if ($(this).html()==val){

              urbanmusic.genrescroll.scrollTo($(this).offset().left
                -$("#genre-scrollview").offset().left,0);
              return false;
           } 
        });
        
        val = this.pop[Math.floor(Math.random()*this.pop.length)];
        $("#pop-list").val(val);
        $("#pop-list").children().each(function(idx){
           if ($(this).html()==val){
              urbanmusic.popscroll.scrollTo($(this).offset().left
                -$("#pop-scrollview"),0);
              return false;
           } 
        });
        
        }catch(e){
            console.log(e);   
        }
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
        		if (data.img == ""){
        		    data.img = "no_aa.jpg"; 
        		}
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
