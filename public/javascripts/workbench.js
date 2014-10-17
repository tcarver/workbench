(function( gdxbase_workbench, $, undefined ) {

	gdxbase_workbench.init = function(jsTreeId) {
		$('#'+jsTreeId).jstree({
	   		'core' : {'check_callback' : true }
	    })
	    .on("before_open.jstree", function (e, data) {
	      	openFolderNode(data, jsTreeId);
	 	}).on('hover_node.jstree',function(e,data){
	 		getDetailsTxt(data.node);
	 	}).delegate("a","click", function(e) {
	      	if ($("#jstree-div").jstree("is_leaf", this)) {
	          	document.location.href = this;
	      	} else {
	        	$("#jstree-div").jstree("toggle_node", this);
	    	}
	   	});
		$('#'+jsTreeId).show();
	}
	
	
	function getDetailsTxt (node) {

		var parts = node.id.split('--');
		if(parts.length === 1) // sub-folder
			return;

		var url;
		var params;
		if(node.id.indexOf("GDxBase__Persistable__CompoundGene")) {
			params = {folderId : parts[2]};
			url = "/workbench/gene_details/";
		} else {
			return node.id;
		}

		$.ajax({
			url: url,
			type: 'POST',
			data: params,
			success: function(result,status){
				var json = JSON.parse(result);
				console.log(json);
				var txt = '';
				for (var i = 0; i < json.ensid.length; i++) {
					txt += json.ensid[i] + ' ';
				}
				$("#"+node.id).prop('title', txt);
			},
			error: function(XMLHttpRequest, textStatus, errorThrown){
				console.log('error');
			}
		});
		
		
/*		console.log(data.instance.get_node(data.node, true).find('span'));
		
 		data.instance.get_node(data.node, true).find('span').qtip({
			content: {
				text: "Loading...Please wait...",
				title: {
					//text: 'PhenoTags Overview for ' + $(this).attr('title'),
					text:' ',
					button: true
				},
				ajax: {
					url: url,
					type: 'POST',
					data: params,
					success: function(result,status){
						var json = JSON.parse(result);
						console.log(json);
						var txt = '';
						for (var i = 0; i < json.ensid.length; i++) {
							txt += json.ensid[i] + ' ';
						}
						//$("#"+node.id).prop('title', txt);
					},
					error: function(XMLHttpRequest, textStatus, errorThrown){
						console.log('error');
					}
				}
			},
			position: {
				my: 'top center',
				at: 'bottom center',
				viewport: $(window), // Keep the tooltip on-screen at all times
				effect: false // Disable positioning animation
			},
			show: {
				event: 'click',
				solo: true // Only show one tooltip at a time
			},
			hide: 'unfocus',
			style: {
				classes: 'qtip-help qtip-shadow qtip-rounded ',
				width:300
			}
		});*/
	}
	
	function openFolderNode (data, jsTreeId){ 
      	var children = data.node.children;
		for (var i = 0; i < children.length; i++) {
			var parts = children[i].split('--');
			if(parts.length === 1) // sub-folder
				continue;

			var childNode = '#'+escapeId(children[i]);
			var perlClass= parts[1];
			perlClass = perlClass.replace(/__/g, '::');
			if(isInt(parts[2])) {
				//console.log(perlClass+ ' ' +parts[2]);
				getChildNodeName(jsTreeId, perlClass, parts[2], childNode);
			} else {
				var html = getHTMLLink(perlClass, parts[2], parts[2]);
				$('#'+jsTreeId).jstree("rename_node", childNode, html);
			}
		}
	}

	function getChildNodeName(jsTreeId, perlClass, folderId, childNode) {
		var url = "/workbench/";
		var params = {folderId : folderId, perlClass : perlClass};
		$.ajax({
			url: url,
			cache:true,
			type: 'POST',
			data: params,
			success: function(result,status){
				var html = getHTMLLink(perlClass, result, folderId);
				$('#'+jsTreeId).jstree("rename_node", childNode, html);
			},
			error: function(XMLHttpRequest, textStatus, errorThrown){
				console.log('error');
			}
		});	
	}
	
	function getHTMLLink(perlClass, result, folderId) {
		var html = '<a href="http://www.immunobase.org/page/Overview/display/';
		if(perlClass === 'GDxBase::Persistable::CompoundGene') {
			html += 'gene/';
		} else if (perlClass === 'GDxBase::Persistable::Locus') {
			html += 'locus_id/';
		} else if (perlClass === 'GDxBase::Persistable::Marker') {
			html += 'marker/';
		} else if (perlClass === 'GDxBase::Persistable::Study') {
			html += 'study/';
		} else if (perlClass === 'GDxBase::Persistable::Disease') {
			html += 'disease/';
		} else {
			return result;
		}
		html += folderId + '">'+result+'</a>';
		return html;
	}

 	function isInt(n){
    	return n%1===0;
	}

	function escapeId(myid) { 
		   return myid.replace(/(:|\.|\|)/g,'\\$1');
	}
}( window.gdxbase_workbench = window.gdxbase_workbench || {}, jQuery ));
