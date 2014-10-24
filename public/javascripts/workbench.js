(function( gdxbase_workbench, $, undefined ) {

	gdxbase_workbench.init = function(jsTreeId) {
		$( '#'+jsTreeId ).on( "click", 'li', function() {
			openFolderNode(this, jsTreeId);
		});
		$( '#'+jsTreeId ).on( "mouseenter", 'li a', function() {
			getDetailsTxt(this);
		});
		$('#'+jsTreeId).tree({'color':'darkgreen'});
		$('#'+jsTreeId).show();
	}

	function getDetailsTxt (node) {
		var id = $(node).parent('li').attr('id');
		var parts = id.split('--');
		if(parts.length === 1) // sub-folder
			return;

		var url;
		var params;
		var title = $(node).text();
		if(id.indexOf("GDxBase__Persistable__CompoundGene") > 0) {
			params = {folderId : parts[2]};
			url = "/workbench/gene_details/";
			title += ' Gene Details';
		} else {
			return id;
		}

		$(node).qtip({
			content: {
				text: "Loading...Please wait...",
				title: {
					text:title,
					button: true
				},
				ajax: {
					url: url,
					type: 'POST',
					data: params,
					success: function(result,status){
						var json = JSON.parse(result);
						var txt = '';
						$.each(json.keywords, function(index, key) {
							txt += '<b>'+key+':</b> ';
							for (var i = 0; i < json[key].length; i++) {
								txt += json[key][i];
								if(i < json[key].length-1) {
									txt += ', ';
								}
							}
							txt += '<br/>';
						});
						this.set('content.text', txt);
						//$("#"+id).prop('title', txt);
						//console.log('#qtip-'+$(this).attr('id'));
						$('#qtip-'+$(this).attr('id')).css("max-width","600px");
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
				ready: true,
				solo: true // Only show one tooltip at a time
			},
			hide: 'unfocus',
			style: {
				classes: 'qtip-help qtip-shadow qtip-rounded ',
				width:300
			}
		});
	}

	function openFolderNode (data, jsTreeId){
      	$(data).find('li').each(function( index ) {
      	  var id = $( this ).attr('id');
      	  if(id !== undefined) {
      		  var parts = id.split('--');      	  
      		  var childNode = '#'+escapeId(id);
      		  var perlClass= parts[1];
      		  perlClass = perlClass.replace(/__/g, '::');
      		  if(isInt(parts[2])) {
      			  getChildNodeName(jsTreeId, perlClass, parts[2], childNode);
      		  } else {
      			  var html = getHTMLLink(perlClass, parts[2], parts[2]);
      			  updateLeaf($(childNode), html);
      		  }
      	  } 
      	});
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
				updateLeaf($(childNode), html);
			},
			error: function(XMLHttpRequest, textStatus, errorThrown){
				console.log('error');
			}
		});	
	}
	
	// update leaf node with the font awesome element intact
	function updateLeaf(node,html){
		var fontawesomeObj = node.find('.fa-li');
		node.html('');
		node.append(fontawesomeObj);
		node.append(html);
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
