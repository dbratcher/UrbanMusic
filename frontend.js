
function addToList(data,list){
    console.log("add to list");
    for (var i=0;i<data.length;i++){
        list.append("<li>"+data[i]+"</li>");   
    }
}

function doload(){
    console.log("doload");
    $.ajax({
      url: "years.json",
      dataType: "json",
      success: function(data){
        var list = $("#year-list");
        addToList(data,list);
      }
    });
    
    $.ajax({
      url: "genre.json",
      dataType: "json",
      success: function(data){
        var list = $("#genre-list");
        addToList(data,list);
      }
    });
}

console.log("frontend.js");
window.addEventListener("load",doload,false);