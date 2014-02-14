$(function(){
	//
	$canvas = $("#canvas");
	
	//load system
	$.get("data/system.json", function(system){
		console.log(system);
	});
	
	$(".node").click(function(e){
		if(e.target.nodeName == "IMG"){
			if($(this).hasClass("open")){
				$(this).removeClass("open");
				$(this).addClass("closed");
			}else {
				$(this).removeClass("closed");
				$(this).addClass("open");
			}
		}
	});
	
	//Change between live & trace modes
	$('#displaymode').click(function(){
		$m = $('.onoffswitch').data('mode');
		if($m == "live"){ $('.onoffswitch').data('mode', "trace"); }
		else{ $('.onoffswitch').data('mode', "live"); }
	});
	
});