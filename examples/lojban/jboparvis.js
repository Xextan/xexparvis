/***** consts *****/

const inputContainer = document.getElementById('source');
const outputContainer = document.getElementById('tab-content');
const errorContainer = document.getElementById('error');

const parvis = new Parvis ();
parvis.ruleDisplayMap.set( ['spaces','initial_spaces'], '•' );
parvis.sourceToViewMap.set( '', '∅' ).set( '_', '␣' ).set( ' ', '␣' );
parvis.viewToSourceMap.set( '∅', '' ).set( '␣', ' ' );
parvis.whitespaceRegex = /^[\s._]*$/;
parvis.cnRuleGroupMap.set( 'phon', 'final_syllable,stressed_syllable,stressed_diphthong,stressed_vowel,unstressed_syllable,unstressed_diphthong,unstressed_vowel,stress,stressed,any_syllable,syllable,consonantal_syllable,coda,onset,nucleus,glide,diphthong,vowel,a,e,i,o,u,y,cluster,initial_pair,initial,affricate,liquid,other,sibilant,consonant,syllabic,voiced,unvoiced,l,m,n,r,b,d,g,v,j,z,s,c,x,k,f,p,t,h'.split(',') );
parvis.cnRuleGroupMap.set( 'morph', 'zifcme,jbocme,brivla,brivla_core,stressed_initial_rafsi,initial_rafsi,any_extended_rafsi,stressed_extended_rafsi,extended_rafsi,stressed_brivla_rafsi,brivla_rafsi,stressed_fuhivla_rafsi,fuhivla_rafsi,fuhivla_head,brivla_head,slinkuhi,rafsi_string,CVV_final_rafsi,short_final_rafsi,stressed_y_rafsi,stressed_y_less_rafsi,stressed_long_rafsi,stressed_CVC_rafsi,stressed_CCV_rafsi,stressed_CVV_rafsi,y_rafsi,y_less_rafsi,hy_rafsi,stressed_hy_rafsi,long_rafsi,CVC_rafsi,CCV_rafsi,CVV_rafsi,r_hyphen,'.split(',') );
parvis.cnRuleGroupMap.set( 'word', 'gismu,fuhivla,cmevla,cmavo,CVCy_lujvo,cmavo_form,ybu,lujvo,A,BAI,BAhE,BE,BEI,BEhO,BIhE,BIhI,BO,BOI,BU,BY,CAhA,CAI,CEI,CEhE,CO,COI,CU,CUhE,DAhO,DOI,DOhU,FA,FAhA,FAhO,FEhE,FEhU,FIhO,FOI,FUhA,FUhE,FUhO,GA,GAhO,GEhU,GI,GIhA,GOI,GOhA,GUhA,I,JA,JAI,JOhI,JOI,KE,KEhE,KEI,KI,KOhA,KU,KUhE,KUhO,LA,LAU,LAhE,LE,LEhU,LI,LIhU,LOhO,LOhU,LU,LUhU,MAhO,MAI,ME,MEhU,MOhE,MOhI,MOI,NA,NAI,NAhE,NAhU,NIhE,NIhO,NOI,NU,NUhA,NUhI,NUhU,PA,PEhE,PEhO,PU,RAhO,ROI,SA,SE,SEI,SEhU,SI,SOI,SU,TAhE,TEhU,TEI,TO,TOI,TUhE,TUhU,UI,VA,VAU,VEI,VEhO,VUhU,VEhA,VIhA,VUhO,XI,Y,ZAhO,ZEhA,ZEI,ZI,ZIhE,ZO,ZOI,ZOhU'.split(',') );
parvis.cnRuleGroupMap.set( 'important', 'sentence,selbri,sumti'.split(',') );
parvis.propagatedRuleGroupArray.push ( 'phon', 'morph' );
parvis.getGloss = function ( source ) {
	var g = shortDescriptions [source];
	return g ? g : '';
};


/***** functions *****/

function refresh_output() {
	try {
		let s = inputContainer.value;
		let r = camxes.parse( s );
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
	set_input( `coi pilno ti selcme zo .jboparvis.` );
}
function sample2() {
	set_input( `.o'i mu xagji sofybakni cu zvati le purdi` );
}
function sample3() {
	set_input( `.i ro mi'o djuno lo du'u le mlatu poi xekri gi'e sarji la .lojban. cu zabna\n` );
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
