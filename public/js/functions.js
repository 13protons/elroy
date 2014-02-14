$(function(){
	$.get("data/model.json", function(model){
		$.get("templates/node.ejs", function(_template){
			$canvas = $("#canvas");
			$canvas.fog = $("#fog .fog.container");
			$canvas.cloud = $("#cloud .cloud.container");
			
			model.nodes = {"template": _template};
			
			//render fog hub
			/* type, id, iconUrl, status */
			
			//ejs.render(template, data);
			model.fog.id = "fog_1";
			model.fog.html = renderNode("fog", model.fog);

			$canvas.fog.append(model.fog.html);
			
			//render devices
			for(key in model.fog.devices){
				console.log(key);
				device = model.fog.devices[key];
				device.id = "device_" + key;
				device.html = renderNode("device", device);
				$canvas.fog.append(device.html);
				model.fog.devices[key] = device;
				//console.log(device);
			}
			
			//render consumers
			for(key in model.consumers){
				device = model.consumers[key];
				device.id = "consumer_" + key;
				device.html = renderNode("consumer", device);
				$canvas.cloud.append(device.html);
				model.consumers[key] = device;
				//console.log(device);
			}
			
			

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

			function updateStates(){
				for(key in model.fog.devices){
					device = model.fog.devices[key];
					(function(device){
						$.get(device.update, function(siren){
							//update status bubble
							//console.log(siren);
							var target = $("#" + device.id);
							if(target.data('state') != siren.properties.state){
									var state = siren.properties.state;
									target.find(".entityMeta .name")
										.html(siren.properties.name);
								   	target.data('state', state);
									target.find(".status").html(state);
									target.find(".entityMeta .state").html(state);
									//update internals
									target.find(".content .actions").empty();
									for(i in siren.actions){
										target.find(".content .actions")
										.append(renderAction(siren.actions[i]));
									}
							   }
							
						});
					})(device);
				}
			}
			function renderNode(type, d){
				var html = ejs.render(model.nodes.template, {
					"node": {
						"type": type,
						"id": d.id,
						"iconUrl": d.iconUrl,
						"status": null
					}
				});
				return html;
			}
			
			function renderAction(action){
				console.log("action: ", action);
				var container = $('<form>');
				var visible = false;
				container.attr({
					"method": action.method,
					"action": action.href
				});
				for(var i = 0; i < action.fields.length; i++) {
					var field = action.fields[i];

					var label = $('<label>')
					  .addClass('control-label')
					  .attr('for', action.name + field.name)
					  .text(field.title || field.name);

					var controls = $('<fieldset>').addClass('controls');

					var input = $('<input>')
					  .attr('name', field.name)
					  .attr('id', action.name + field.name)
					  .attr('type', field.type || 'text')
					  .val(field.value);

					controls.append(input);

					if (field.type !== 'hidden') {
					  visible = true;
					  container.append(label);
					}

					if(!visible){controls.addClass("hiddenControls"); }
					container.append(controls);
					
				  };
				  var submit = $('<button>').attr({
				  	"type": "submit"
				  }).addClass('pure-button').html(action.name);
				  container.append(submit)
				  
				  //add to node here
				  return container;
				}
			
			$(".node").on("submit", "form", function(e){
				e.preventDefault();
				console.log($(this).serialize());
				$.ajax({
					type: "PATCH",
					url: $(this).attr('action'),
					data: $(this).serialize(), 
					contentType: "application/vnd.siren+json",
					success: function(){
						console.log("success");
						updateStates();
					},
					complete: function(){
						console.log("submission complete");
					},
					error: function(e){
						console.log("error: ", e);
					}
				});
				
				
			});
			
			updateStates();
			model.refresh = window.setInterval(function(){
				updateStates();
			}, 1000);
			
		});//get node template
	});//get model
	//Change between live & trace modes
	$('#displaymode').click(function(){
		$m = $('.onoffswitch').data('mode');
		if($m == "live"){ $('.onoffswitch').data('mode', "trace"); }
		else{ $('.onoffswitch').data('mode', "live"); }
	});
	
	
	
	
	
});