package WorkBench;
use Dancer ':syntax';

use GDxBase::Persistable::Folder;
use GDxBase::DBHandler;
use Data::Dumper;


get '/workbench/' => sub {
    my $ini_file = config->{CONFIG}; # config 
	my $dbhandler = GDxBase::Dispatcher->default_environment( $ini_file );
	GDxBase::Persistable::Folder->dbh(
                $dbhandler->get_dbh( section => 'WORKSPACE' ) );

    my $where = "visibility='public'";
	my @objs  = GDxBase::Persistable::Folder->fetch_all( where => $where );
	my %tree  = treeObject2Hash(\@objs);

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

sub treeObject2Hash {
	my @objs = @{$_[0]};
	my %tree = ();
	my @childTree;
	foreach my $node ( @objs ) {
		if($node && $node->isa('GDxBase::Persistable::Folder')) {
			my $name = $node->name;
			my $parent = $node->folder_id;
			my $passed = $name;
            $passed =~ s/\s/_/g;

			my @node_details;
			my $classoids = $node->oids;
          	foreach my $class (keys %{$classoids}) {
    	    	next unless scalar $classoids->{$class};
            	foreach my $oid (@{ $classoids->{$class} }) {
              		next unless $oid;

	      			if($class eq 'GDxBase::Persistable::Folder') {
	      				#nested folder
                		my %sub_tree = getChildNodeTree(\@objs, $oid);
                		#print Dumper(%sub_tree);
                		my $perlClass = $class;
                		$perlClass =~ s/::/__/g;
              		   	push(@node_details, 
              		   		{ 'oid'   => $oid, 'class' => $perlClass, 
              		   		  'passed'=> $passed, 'parent_id'=>$parent, 'child' => \%sub_tree });
              		   	push(@childTree, keys %sub_tree);
              		} else {
              			my $perlClass = $class;
              		  	$perlClass =~ s/::/__/g;
              		   	push(@node_details, {'oid'=>$oid, 'class'=>$perlClass, 'passed'=> $passed, 'parent_id'=>$parent });
              		}
            	}
          	}
          	$tree{$name} = [ @node_details ];
		}
    }

    delete @tree { @childTree }; # remove child folder nodes from top level
    return %tree;
}

sub getChildNodeTree {
	my @objs = @{$_[0]};
	my $child_folder_id = $_[1];
	foreach my $node ( @objs ) {
		if($node && $node->isa('GDxBase::Persistable::Folder')) {
			my $folder_id = $node->folder_id;
			if($folder_id == $child_folder_id) {
				my %tree = ();
				my $name = $node->name;
				my $passed = $name;
            	$passed =~ s/\s/_/g;

				my @node_details;
				my $classoids = $node->oids;
          		foreach my $class (keys %{$classoids}) {
    	    		next unless scalar $classoids->{$class};
            		foreach my $oid (@{ $classoids->{$class} }) {
              			next unless $oid;
	      				my $perlClass = $class;
              		  	$perlClass =~ s/::/__/g;
              		   	push(@node_details, {'oid'=>$oid, 'class'=>$perlClass, 'passed'=> $passed });
            		}
          		}
          		$tree{$name} = [ @node_details ];
				return %tree;
			}
		}
    }
    return -1;
}

true;
