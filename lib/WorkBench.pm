package WorkBench;
use Dancer ':syntax';
use WorkBenchTree;
use Data::Dumper;

get '/workbench/' => sub {
	my $ini_file = config->{CONFIG}; # config 
	my $dbhandler = GDxBase::Dispatcher->default_environment( $ini_file );
	GDxBase::Persistable::Folder->dbh(
                $dbhandler->get_dbh( section => 'WORKSPACE' ) );

	my $where = "visibility='public'";
	my @objs  = GDxBase::Persistable::Folder->fetch_all( where => $where );
	my %tree  = WorkBenchTree->treeObject2Hash(\@objs);

	template 'workbench', {
		'tree' => \%tree,
		'visibility' => 'Public',
		'project' => 'Immunobase'
	};
};

post '/workbench/' => sub {
	return GDxBase::Persistable->get_preferred_name(
	         params->{folderId}, params->{perlClass});
};

post '/workbench/gene_details/' => sub {
	my $gene = new GDxBase::Persistable::CompoundGene(locus_link_id => params->{folderId});
	debug($gene);
	return  to_json { ensid => $gene->ensembl_id_all };
};

true;
