/* consts */
const inputContainer = document.getElementById("source");
const outputContainer = document.getElementById("output");
const cbInsertSpaces = document.getElementById("insert_spaces");
var err = false;

const parvis = new Parvis ();
//parvis.sourceToViewMap.set( '', '∅' ).set( '_', '␣' );
//parvis.viewToSourceMap.set( '∅', '' ).set( '␣', ' ' );
//parvis.whitespaceArray = [ '_' ];


/* input functions */

function sample1() {
	cbInsertSpaces.checked = true;
	inputContainer.value = `["sentence",["subj",["NP",["pronoun","I"]]],["predicate",["V","think"],["DO",["COMP","that"],["clause",["subj",["NP",["pronoun","I"]]],["predicate",["VP",["AuxV","shall"],["VP",["Adv","never"],["V","see"]]],["DO",["NP",["NP",["DET","a"],["N","poem"]],["AdjP",["Adj","lovely"],["PP",["P","as"],["NP",["DET","a"],["N","TREE"]]]]]]]]]]]`;
	refresh_output();
}
function sample2() {
	cbInsertSpaces.checked = false;
	inputContainer.value = `["text",["text_1",["paragraphs",["paragraph",["statement",["statement_1",["statement_2",["statement_3",["sentence",[["terms",["terms_1",["terms_2",["term",["term_1",["sumti",["sumti_1",["sumti_2",["sumti_3",["sumti_4",["sumti_5",["sumti_6",["KOhA_clause",["KOhA_pre",["KOhA",[["m","m"],["i","i"]]],["spaces","_"]]]]]]]]]]]]]]],["CU"]],["bridi_tail",["bridi_tail_1",["bridi_tail_2",["bridi_tail_3",["selbri",["selbri_1",["selbri_2",["selbri_3",["selbri_4",["selbri_5",["selbri_6",["tanru_unit",["tanru_unit_1",["tanru_unit_2",["BRIVLA_clause",["BRIVLA_pre",["BRIVLA",["gismu",[["initial_pair",["consonant",["syllabic",["m","m"]]],["consonant",["syllabic",["l","l"]]]],["stressed_vowel",["vowel",["a","a"]]]],["consonant",["unvoiced",["t","t"]]],["vowel",["u","u"]]]],["spaces","_"]],["BRIVLA_post",["post_clause",["spaces","_"]]]]]]]]]]]]]],["tail_terms",["VAU"]]]]]]]]]]]]]]]`;
	refresh_output();
}


/* output functions */

function refresh_output() {
	try {
		parvis.sourceSeparator = ( cbInsertSpaces.checked ? ' ' : '' );
		let s = inputContainer.value.trim();
		if ( s != '' ) {
			outputContainer.innerHTML = parvis.toHtml( s );
		}
		else {
			outputContainer.innerHTML = '';
		}
		err = false;
		refresh_output_class();
		console.log( 'Done refreshing output.' );
	} catch (e) {
		err = true;
		refresh_output_class();
		let h = `<b>Source text must be in valid "tree" (nested-array) form.</b>`
			+ `\n\n<u>` + e.name + `</u>\n` + e.message
			+ `\n\n<u>Stack</u>\n` + e.stack; ;//
		outputContainer.innerHTML = h;
		console.log( h );
		return;
	}
}
function refresh_output_class() {
	var s = `pv-container`;
	if (err) s += ` error`;
	var v = document.getElementById("filter_nodes").value;
	if ( v !== '' ) s += ` ` + v;
	s += ` ` +  ( parvis.topDown ? parvis.cnpvTopDown : parvis.cnpvBottomUp );
	if (document.getElementById("hide_redundant_source").checked) s+= ' hide_redundant_source';
	if (document.getElementById("hide_spaces").checked) s+= ' hide_spaces';
	outputContainer.className = s;
}
function select_box_css() {
	var v = document.getElementById("select_box_css").value;
	if ( v == '' ) return;
	document.getElementById("box_css").setAttribute("href", "../src/node_borders-"+v+".css");
}
function flip_tree() {
	if ( ! err ) {
		parvis.topDown ^= true;
		refresh_output();
	}
}


/* init */

sample2();


/***** eof *****/