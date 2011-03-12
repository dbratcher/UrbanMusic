var urbanmusic = {
    addToList: function addToList(data,list){
       console.log("add to list");
       for (var i=0;i<data.length;i++){
           list.append("<li>"+data[i]+"</li>");   
       }
       list.val(data[0]);
    },
    doload: function(){
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
        data.years = $("#years-list").val();
	data.pop = $("#pop-list").val();
        
        $.ajax({
          url: "listen",
          data: data,
          dataType: "json",
          success: function(data){
            $.mobile.changePage("listen");
          },
          error: function(){
            
          }
        }); 
    }
}





console.log("frontend.js");
window.addEventListener("load",urbanmusic.doload,false);
