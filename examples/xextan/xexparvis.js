/***** consts *****/

const inputContainer = document.getElementById('source');
const outputContainer = document.getElementById('tab-content');
const errorContainer = document.getElementById('error');

const parvis = new Parvis ();
parvis.ruleDisplayMap.set( ['spaces','initial_spaces'], '•' );
parvis.sourceToViewMap.set( '', '∅' ).set( '_', '␣' ).set( ' ', '␣' );
parvis.viewToSourceMap.set( '∅', ' ' ).set( '␣', ' ' );
parvis.whitespaceRegex = /^[\s._]*$/;
parvis.cnRuleGroupMap.set( 'phon', 'freeword_start,CL,FWCL,CL3,D,HD,FWC,FWF,ANY,ANY_C,ANY_V,ANY_H,C,voiced,unvoiced,sibilant,fricative,stop,sonorant,V,V_H,V_H,V_HN,V_L,IG,UG,GV,IG_H,UG_H,GV_H,F,GL,p,b,t,d,k,g,f,v,s,z,x,q,l,n,j,w,m,r,h,a,e,i,o,u,y,a_H,e_H,i_H,o_H,u_H,y_H,a_HN,e_HN,i_HN,o_HN,u_HN,y_HN,a_L,e_L,i_L,o_L,u_L,y_L,punctuation,glottal'.split(',') );
parvis.cnRuleGroupMap.set( 'morph', 'root,root_H,root_L,compound,compound_H,compound_L,freeword,classic_freeword,suffix,numeral,possessive,quantifier'.split(',') );
parvis.cnRuleGroupMap.set( 'word', 'verb,root,root_H,root_L,discursive_illocution,modal_illocution,pronoun,transmogrifier,preposition_SS,preposition_LS,determiner_SS,determiner_LS,tag_SS,tag_LS,binder_SS,binder_LS,modifier,verb_modifier,adverb,connective,quoter,operator,onomatopoeia,suffix,SS_terminator,LS_terminator,DS_terminator,ALL_terminator'.split(',') );
parvis.cnRuleGroupMap.set( 'important', 'sentence,noun_term,predicate_term,verbal'.split(',') );
parvis.propagatedRuleGroupArray.push ( 'phon', 'morph' );
parvis.getGloss = function ( source ) {
	if (shortDescriptions [source] != undefined) {
		var g = shortDescriptions [source];
	} else if (shortDescriptions [source.toLowerCase()] != undefined) {
		var g = shortDescriptions [source.toLowerCase()];
	} else if (shortDescriptions [capitalize(source.toLowerCase())] != undefined) {
		var g = shortDescriptions [capitalize(source.toLowerCase())];
	} else if (shortDescriptions [deaccent(source.toLowerCase())] != undefined) {
		var g = shortDescriptions [deaccent(source.toLowerCase())];
	} else if (shortDescriptions [finals(source.toLowerCase())] != undefined) {
		var g = shortDescriptions [finals(source.toLowerCase())];
	}
	return g ? g : '???';
};


/***** functions *****/

function refresh_output() {
	try {
		let s = inputContainer.value;
		let r = parser.parse( s );
		let h = parvis.toHtml( r );
		document.getElementById('raw_string').innerHTML = JSON.stringify(r);
		document.getElementById('indented_string').innerHTML = JSON.stringify(r, undefined, 2);
		document.getElementById('all_nodes').innerHTML = h;
		document.getElementById('pruned_nodes').innerHTML = h;
		document.getElementById('minimal_nodes').innerHTML = h;
		errorContainer.innerHTML = '';
		refresh_html();
		//console.log( 'Done refreshing output.' );
	} catch (e) {
		let h = e.toString();
		errorContainer.innerHTML = h;
		console.log( h );
		refresh_html();
		return;
	}
}
function refresh_html () {
	inputContainer.style = error () ? 'background:#fcc;' : '';
	var s = '';
	s += ( parvis.topDown ? parvis.cnpvTopDown : parvis.cnpvBottomUp );
	if ( ! document.getElementById('show_phon').checked ) s+= ' hide_phon';
	if ( ! document.getElementById('show_morph').checked ) s+= ' hide_morph';
	if ( ! document.getElementById('show_spaces').checked ) s+= ' hide_spaces';
	outputContainer.className = s;
}
function set_input( text ) {
	inputContainer.value = text;
	refresh_output();
}
function clear_input() {
	set_input( `` );
}
function sample1() {
	set_input( `xoi fol! u gevlá tu tul lu Xéxpárvísy.` );
}
function sample2() {
	set_input( `xel de únági o nia xutvak konfli.` );
}
function sample3() {
	set_input( `xãu dun vo e ban Loqban, xu xa kol pe vo o ban Xextan.` );
}
function flip_tree() {
	if ( ! error() ) {
		parvis.topDown ^= true;
		refresh_output();
	}
}
function toggle_error() {
	var b = document.getElementById('toggle_error');
	if ( errorContainer.style.display == '' ) {
		errorContainer.style.display = 'none';
		b.innerHTML = 'Show error';
	}
	else {
		errorContainer.style.display = '';
		b.innerHTML = 'Hide error';
	}
}
function error () {
	return !! errorContainer.innerHTML;
}

function deaccent(s) {
                return s.replace(/[‘’]/g, "'").replace(/[áãâ]/g, "a").replace(/[éẽê]/g, "e").replace(/[íĩî]/g, "i").replace(/[óõô]/g, "o").replace(/[úũû]/g, "u").replace(/[ýỹŷ]/g, "y");
            }
			
function capitalize(val) {
    return String(val).charAt(0).toUpperCase() + String(val).slice(1);
}

function finals(s) {
	let letter
		if (s.at(-1) == "g") {
		letter = "k";
		} else if (s.at(-1) == "d") {
		letter = "t";
		} else if (s.at(-1) == "b") {
		letter = "p";
		} 
return s.substr(0,2) + letter;
}

/***** tab stuff *****/

function tab_click( button ) {
	for (const c of document.getElementById('tab-content').children) {
		c.style.display = button.id == 'button-'+c.id ? 'block' : 'none';
	}
	for (const b of document.getElementById('tab-buttons').children) {
		b.className = button==b ? 'active' : '';
	}
}


/***** initialize page *****/

for (const c of document.getElementById('tab-buttons').children) {
	c.id = 'button-' + c.innerHTML.replace( ' ', '_' ).toLowerCase();
}

const hash = window.location.hash;
if ( ! hash ) sample1 ();
else set_input ( decodeURI( hash.substr( 1 )) );

const params = new URLSearchParams( window.location.search );

const tab = params.get( 'tab' );
document.getElementById( 'button-' + (tab ? tab : 'minimal_nodes') ).click();


/***** eof *****/
