$(function(){
	var byline_template = '<p><strong><%= name %></strong> is <strong><%= state %></strong><p>';
	var device_insert = '<div class="device_report <%= deviceId %>"></div>'
	
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
			
			model.cloud.id = "cloud_1";
			model.cloud.html = renderNode("cloud", model.cloud);
			//$canvas.fog.append(model.fog.html);
			//$canvas.append(model.fog.html);
			
			//render consumers
			for(key in model.consumers){
				consumer = model.consumers[key];
				consumer.id = "consumer_" + key;
				consumer.html = renderNode("consumer", consumer);
				//$canvas.cloud.append(consumer.html);
				$canvas.append(consumer.html);
				model.consumers[key] = consumer;
				//console.log(device);
			}
			$canvas.append(model.cloud.html);
			$canvas.append(model.fog.html);
			
			//render devices
			for(key in model.fog.devices){
				
				device = model.fog.devices[key];
				device.id = "device_" + key;
				device.html = renderNode("device", device);
				//$canvas.fog.append(device.html);
				$canvas.append(device.html);
				model.fog.devices[key] = device;
				
				var insert = ejs.render(device_insert, {
					"deviceId": device.id
					});
				
				//stick in fog
				$(".fog .content").append(insert);
				//stick in consumers
				for(key in model.consumers){
					$("#" + model.consumers[key].id + " .content").append(insert);
				}
			}
			
			

			

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
									var name = siren.properties.name;
									var actions = []
									
									//for adding to consumers and fog
									var byline = ejs.render(byline_template, {
										"name": name,
										"state": state
									});
									
									$(".fog .content ." + device.id).empty().append(byline);

									//update internals
									target.find(".entityMeta .name").html(name);
									target.data('state', state);
									target.find(".status").html(state);
									target.find(".entityMeta .state").html(state);
						
									target.find(".content .actions").empty();
								
									for(i in siren.actions){
										actions[i] = renderAction(siren.actions[i]);
									}
									
									for(i in actions){
										console.log(actions[i]);
										target.find(".content .actions")
											.append(actions[i].clone());
									}
								
									//add bylines and action to consumer
									for(consumer_key in model.consumers){
										consumer = model.consumers[consumer_key];
										$c = $("#" + consumer.id + " .content ." + device.id);
										$c.empty().append(byline);
										for(i in actions){
											$c.append(actions[i].clone())
										}
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
				//console.log("action: ", action);
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
				//console.log($(this).serialize());
				$.ajax({
					type: "POST",
					url: $(this).attr('action'),
					data: $(this).serialize(), 
					headers: {
						"Accept":"application/vnd.siren+json, application/json",
						"Content-Type": "application/x-www-form-urlencoded"
					},
					
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
			
			$(".node").draggable();
			
			$(".node").dblclick(function(e){
				if(e.target.nodeName == "IMG"){
					if($(this).hasClass("closed")){
						$(this).removeClass("closed");
						$(this).addClass("open");
					}
				}
			});
			
			$(".node").click(function(e){
				if(e.target.nodeName == "IMG"){
					if($(this).hasClass("open")){
						$(this).removeClass("open");
						$(this).addClass("closed");
					}
				}
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