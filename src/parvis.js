// Version 0.1pre

'use strict';

function Parvis () {

	/* */
	this.debug = false;
	/*
	change the order of displayed elements */
	this.topDown = true;

	/* node name ('label') processing
	The four chars should be something other than {alphanumeric|'-'|'_'} (CSS class name chars)
	*/
	this.ruleDisplayMap = new Map();
	this.ruleIterator = '+';
	this.ruleSeparator = ',';
	this.ruleLeftDelimiter = '(';
	this.ruleRightDelimiter = ')';

	/* source text processing
	*/
	this.sourceSeparator = ''; // this can be used if desired when original spaces are not found in tree
	this.sourceToViewMap = new Map(); // e.g. [['', '∅'], [' ', '␣'], ['_', '␣']]; // when first found //TODO regex
	this.viewToSourceMap = new Map(); // e.g. [['∅', ''], ['␣', ' ']]; // when merging at higher levels //TODO regex
	this.whitespaceRegex = /^[\s]*$/; // matching items will be regarded as whitespace (used for source-text classes)

	/* class names
	Abbreviations:
	cn-: "class name"
	cnp-: "class name prefix"
	cnet-: "class name / edge type" for <div>.	an 'edge' is a link between a parent node and a child node
	cndv-: "class name / data view" for <p>		data is divided into r (for rule-symbol) and s (for source-text)
	rg - rule-symbol group - a group of rule-symbols defined by user
	cc - child count
	(n)sp - (non)space

	Notes:
	(!1) baked into core CSS, be aware
	(!2) all classes and class prefixes (excluding some in (!1)) must contain leading space (TODO: make setter or something and adjust this automatically)
	(!3) do NOT add leading space (TODO fix automatically)
	(!4) add trailing space
	*/
	this.cnpvTopDown = 'pv-top_down'; // (!1)
	this.cnpvBottomUp = 'pv-bottom_up'; // (!1)
	/* Does node have parent? */
	this.cnetRoot = 'et-root';		// (!1,2) for the <div>-level class, one per pv-container, containing tree root
	this.cnetChild = 'et-child';	// (!1,2) for the <div>-level class for any node that's not a root
	/* Does node have children? - These are not really needed: can use et-cc-0, et-cc-1, et-cc-m instead.  TBD
	//this.cnetLeaf = ' et-leaf'; 	// (!1,2) TODO <div>-level class for end-nodes in tree (not necessarily in display)
	//this.cnetParent = ' et-parent'; // (!1,2) TODO <div>-level class for any node that's not a leaf
	*/
	this.cndvRule = 'dv-rule';	// (!1) <p>-level class displaying node rule-symbol
	this.cndvSource = 'dv-source';	// (!1) <p>-level class displaying node source-text
	this.cndvGloss = 'dv-gloss';	// (!1) <p>-level class displaying node gloss
	this.cnpRule = ' r-'; 	// (!2) <p(rule)>/<div>-level to identify each node by the name appearing in tree
	this.cnRuleGroupMap = new Map(); // map of (groupname (string) : nodenames (array of strings)).  omitting class prefixes, which are added automatically
	this.propagatedRuleGroupArray = []; // these groups will copied recursively up the tree to unnamed nodes whenever children belong to group
	this.cnpRuleGroup = ' rg-'; // (!2) <p(rule)>/<div>-level to identify nodes by group
	this.cnpEdgeType = ' et-';	// (!2) <p(rule)>/<div>-level to identify node by metadata
	this.cnpChildCount = 'cc-'; // (!3)
	this.cnpChildCountNotSpace = 'cc_nsp-'; // (!3)
	this.cnpSiblingCount = 'sc-'; // (!3)
	this.cnpSiblingCountNotSpace = 'sc_nsp-'; // (!3)
	this.cnpSourceDataSpace = ' sd-sp-'; // (!2)

	/* if these fixes are disabled, an error is thrown if the condition is encountered */
	this.fixOneStringArrays = true; // missing element in "one-string arrays" are interpreted as implicit empty terminal '' (and NOT as an unnamed node, which is though a possibility: TODO).  Default: true.
	this.fixBareStringTrees = false; // when trees are bare strings, assume missing empty terminal; again we have two possibilities (TODO if needed). Default: false.
	this.fixMissingRule = true; // when trees are arrays with no node rule-symbol, build one from children. Default: true.
	//this.unnamedNodeDefault = '?'; // use this when fixing the unnamed nodes of trees with no children.  Default: '?' (not sure if needed)
	//this.ignoreEmptyArrays = false; // this nonsense should not exist (TODO if needed)
	this.maxDepth = 99;
}

Parvis.prototype.toHtml = function ( tree ) {
	if ( isString(tree) ) {
		tree = JSON.parse(tree);
	}
	//return JSON.stringify( tree );
	var [html] = this.toHtmlR (tree , 0, 0 );
	return html;
}

Parvis.prototype.toHtmlR = function ( tree, depth, siblingCount ) {
	if ( this.maxDepth < depth ) throw new SyntaxError('too much recursion');
	var r; // current node's rule-symbol (string)
	var s; // current node's source-text (string)
	var ca; // current node's children (array)
	//var rf = false; // rule-symbol found in current node (build from children if not)
	//var sf = false; // source-text found in current node (build from children if not)

	if (! (tree instanceof Array) ) {
		if ( ! isString (tree) ) throw new SyntaxError('invalid tree (neither string nor array)');
		if ( ! fixBareStringTrees ) throw new SyntaxError('invalid tree (bare string)');
		r = tree;
		s = '';
	}
	else if ( tree.length == 0 ) {
		throw new SyntaxError( 'invalid tree (empty array)');
	}
	else if ( ! isString (tree[0]) ) {
		if ( ! this.fixMissingRule ) throw new SyntaxError('invalid tree (missing rule-symbol)');
		ca = tree;
	}
	else {
		[r, ...ca] = tree;
		if ( ca.length == 0 ) {
			if ( ! this.fixOneStringArrays ) throw new SyntaxError(
				'missing element after "'+r+'" (array length is 1 not 2)');
			s = '';
		}
		else if ( ca.length == 1 && isString(ca[0]) ) {
			s = ca[0];
			ca = undefined;
		}
	}
	var cc = ca ? ca.length : 0; // child count
	var icc = 0; // "important" child count (= not-whitespace)
	var w = true; // current node contains only whitespace
	var cah = ''; // child-array html
	let car = ''; // rule-symbol to be built from child-array
	let rs = undefined;
	var v; // "view";
	if ( s != null ) { // this is a terminal symbol
		if ( 0 < cc ) throw new Error("s != null && 0 < cc (this shouldn't happen 1)"); //sanity check 1/2
		w = this.whitespaceRegex.test ( s );
		let s2 = this.sourceToViewMap.get(s);
		if ( isString(s2) ) {
			s = s2;
			v = s2; // get rid of «»
		}
	}
	else { // this is a nonterminal symbol
		if ( 0 == cc ) throw new Error("s == null && 0 == cc (this shouldn't happen 2)"); //sanity check 2/2
		s = ''; // why?
		g = ''; // why?
		let ln = null; // last remainder element node
		for (const re of ca){
			var [ceh, cer, ces] = this.toHtmlR (re, depth + 1, cc);
			cah += ceh;
			if ( 0 < s.length ) s += this.sourceSeparator;
			let s2 = this.viewToSourceMap.get(ces);
			if ( isString(s2) ) ces = s2;
			if ( cer === ln ) {
				if (! car.endsWith(this.ruleIterator)) car += this.ruleIterator;
			}
			else {
				if (0 < car.length ) car += this.ruleSeparator;
				car += cer;
			}
			s += ces;
			if ( ! this.whitespaceRegex.test ( ces ) ) {
				icc ++;
				w = false;
			}
			ln = cer;
		}

		if ( r == undefined ) {
			rs = new Set (car
					.replace(this.ruleIterator, '')
					.replace(this.ruleLeftDelimiter, '')
					.replace(this.ruleRightDelimiter, '')
					.split(this.ruleSeparator));
			r = this.ruleLeftDelimiter + car + this.ruleRightDelimiter;
		}
	}

	// dc : div classes, but also added to rh if bDivWrap is false
	let dc = depth == 0 ? this.cnetRoot : this.cnetChild;
	dc += this.cnpEdgeType + this.cnpChildCount + cc
			+ this.cnpEdgeType + this.cnpChildCountNotSpace + icc;
	if (cc > 1) dc += this.cnpEdgeType + this.cnpChildCount + 'm'; // m=multiple
	if (icc > 1) dc += this.cnpEdgeType + this.cnpChildCountNotSpace + 'm'; //  m=multiple
	if ( 0 < depth ) {
		dc += this.cnpEdgeType + this.cnpSiblingCount + siblingCount;
		if ( siblingCount > 1 ) dc += this.cnpEdgeType + this.cnpSiblingCount + 'm';
		//TODO et-sc_nsp
	}
	dc += this.cnpSourceDataSpace + (w?'1':'0');

	if ( rs ) {
		for (const re of rs){
			dc += this.cnpRule + re;
		}
		for (const e of this.propagatedRuleGroupArray) {
			let a = this.cnRuleGroupMap.get(e);
			let ei = false;
			for (const re of rs) {
				ei ||= a.includes( re );
			}
			if ( ei ) dc += this.cnpRuleGroup + e;
		}
	}
	else {
		dc += this.cnpRule + r;
		for (const [e, a] of this.cnRuleGroupMap) {
			if ( a.includes ( r ) ) {
				dc += this.cnpRuleGroup + e;
			}
		}
	}

	var l = r;
	for (const [e, s2] of this.ruleDisplayMap) {
		if ( e == l || e.includes(l) ) l = s2;
	}
	var rh = `<p class="` + this.cndvRule + `">`+l
		+ `<span class="tooltip">rule symbol: <code>`+r+`</code>&#xa;`
		+ ( cc==0 ? `no children` : (cc==1 ? `one child` : `children` ) + `: <code>`+car+`</code>` );
	if ( this.debug ) rh += `&#xa;node html-classes:<code>` + dc + `</code>`;
	rh += `</span></p>`;
	var g = this.getGloss( s );
	var gh = `<p class="` + this.cndvGloss + `">`+g+`</p>`;
	var st = `<span class="tooltip">source-text: `+(v?v:`«`+s+`»`)+(g?`&#xa;gloss: “`+g+`”`:``)+`</span>`;
	var sh = `<p class="` + this.cndvSource + `">`+ (s?s:'&nbsp;') + st + `</p>`;
	var dh1 = `<div class="` + dc + `">`;
	var dh2 = `</div>`;
	var h = '';
	if ( this.topDown ) {
		h = dh1 + rh + gh + sh + cah + dh2;
	}
	else {
		h = dh1 + cah + sh + gh + rh + dh2;
	}

	return [ h, r, s ];
}
// TODO: pass metadata; phon/morph bits should not get gloss
Parvis.prototype.getGloss = function ( source ) {
	return '';
}


function isString(s) {
    return typeof(s) === 'string' || s instanceof String;
}
