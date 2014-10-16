(function( gdxbase_workbench, $, undefined ) {

	gdxbase_workbench.openFolderNode = function(data, jsTreeId){ 
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
