module.exports = grammar({
    name: 'heptagon',

    word: $ => $._identifier,

    extras: $ => [
	$.comment,
	/[\s\n]/,
    ],

    conflicts: $ => [
	[$.qualified_ctor, $.modul],
    ],

    rules: {
	source_file: $ => seq (repeat ($.opens), repeat ($.program_desc)),

	_constructor: _ => /[A-Z](_?[A-Za-z0-9])*/,
	_identifier: _ => /[a-z_][a-zA-Z0-9_']*/,

	identifier: $ => $._identifier,
	
	arobase: _ => prec.right(1, "@"),
	default: _ => prec(2, "default"),
	else_: _ => prec.left (3, "else"),
	arrow: _ => prec.right (4, "->"),
	or: _ => prec.left (5, "or"),
	and: _ => prec.left (6, "and"),
	ampersand: _ => prec.left (6, "&"),
	equal: _ => prec.left (7, "="),
	less_greater: _ => prec.left (7, "<>"),
	when: _ => prec.right(9, "when"),
	whenot: _ => prec.right (9, "whenot"),
	star: _ => prec.left (11, "*"),
	not: _ => prec.right (12, "not"),
	fby: _ => prec.right (13, "fby"),
	pre: _ => prec.right (14, "pre"),
	power: _ => prec.left (15, "^"),

	string: $ => seq ('"', optional ($.string_content), '"'),

	string_content: $ => repeat1(choice(
	    token.immediate(/\s/),
	    token.immediate(/\[@/),
	    /[^\\"%@]+|%|@/,
	    $.escape_sequence,
	    alias(/\\u\{[0-9A-Fa-f]+\}/, $.escape_sequence),
	    alias(/\\\n[\t ]*/, $.escape_sequence),
	    $.conversion_specification,
	    $.pretty_printing_indication
	)),

	escape_sequence: $ => choice(
	    /\\[\\"'ntbr ]/,
	    /\\[0-9][0-9][0-9]/,
	    /\\x[0-9A-Fa-f][0-9A-Fa-f]/,
	    /\\o[0-3][0-7][0-7]/),

	conversion_specification: $ => token(seq(
	    '%',
	    optional(/[\-0+ #]/),
	    optional(/[1-9][0-9]*|\*/),
	    optional(/\.([0-9]*|\*)/),
	    choice(
		/[diunlLNxXosScCfFeEgGhHbBat!%@,]/,
		/[lnL][diuxXo]/))),

	pretty_printing_indication: $ => /@([\[\], ;.{}?]|\\n|<[0-9]+>)/,

	program_desc: $ => choice ($.const_dec, $.type_dec, $.node_dec),

	opens: $ => seq ("open", $.modul),

	const_dec: $ => seq ("const", $.identifier, ":", $.ty_ident, $.equal, $.exp),

	type_dec: $ => seq("type", $.identifier,
			   optional(seq($.equal, choice ($.ty_ident, $.enum_ty_desc, $.struct_ty_desc)))),

	enum_ty_desc: $ => choice(alias($._constructor, $.constructor),
				  seq ($._bool, "|", $._bool),
				  seq (alias($._constructor, $.constructor), "|", $.enum_ty_desc)),

	struct_ty_desc: $ => seq ("{", $.label_ty_list, "}"),

	label_ty_list: $ => choice ($.label_ty, seq ($.label_ty, ";", $.label_ty_list)),

	label_ty: $ => seq ($.identifier, ":", $.ty_ident),

	returns: $ => choice ("returns", $.equal),

	node_dec: $ => seq (optional ("unsafe"), $.node_or_fun, field("name", $.identifier),
	                    field("params", optional ($.node_params)), "(", field ("in_params",
			    optional($.nonmt_params)), ")", $.returns, "(", field ("out_params",
			    optional ($.nonmt_out_params)), ")", optional (";"),
			    field ("contract", optional ($.contract)),
			    field("body", $.block_let), "tel", optional (";")),

	node_or_fun: _ => choice ("node", "fun"),

	nonmt_params: $ => seq ($.param, optional( seq (";", optional ($.nonmt_params)))),

	param: $ => seq ($.ident_list, ":", $.located_ty_ident, optional ($.ck_annot)),

	nonmt_out_params: $ => seq ($.var_last, optional (seq (";", optional ($.nonmt_out_params)))),

	constraints: $ => seq ("|", $.semi_sep_list),

	semi_sep_list: $ => choice ($.exp,
				    seq ($.semi_sep_list, ",", $.exp)),

	node_params: $ => seq ("<<", $.nonmt_params, optional ($.constraints), ">>"),

	contract: $ => seq ("contract", optional ( seq ($.block_let, "tel")), optional ($.assume),
			    repeat1($.objective), optional ($.with)),

	assume: $ => seq ("assume", $.exp),

	objective: $ => seq ($.objective_kind, $.exp),

	objective_kind: $ => choice ("enforce", "reachable", "attractive"),

	with: $ => seq ("with", "(", optional ($.nonmt_params), ")"),

	loc_params: $ => seq ($.var_last, optional( seq(";", optional ($.loc_params)))),

	var_last: $ => choice (seq ($.ident_list, ":", $.located_ty_ident, optional ($.ck_annot)),
			       seq ("last", $.identifier, ":", $.located_ty_ident, optional ($.ck_annot),
				    optional(seq ($.equal, $.exp)))),

	ident_list: $ => prec.left (seq ($.identifier, repeat ( seq (",", $.identifier)))),

	located_ty_ident: $ => seq ($.ty_ident, optional (seq ("at", $.identifier))),

	ty_ident: $ => choice ($.qualname,
			       seq ($.ty_ident, $.power, $.simple_exp)),

	ct_annot: $ => choice (seq ("::", $.ck), seq("on", $.on_ck)),

	ck_annot: $ => choice (seq ("::", $.ck), seq ("on", $.on_ck), seq ($.when, $.when_ck)),

	sig_ck_annot: $ => choice (seq ("::", $.ck), seq ("on", $.on_ck)),

	ck: $ => choice (".", $.on_ck),

	on_ck: $ => choice ($.identifier,
			    seq ($.constructor_or_bool, "(", $.identifier, ")"),
			    seq ($.ck, "on", $.identifier),
			    seq ($.ck, "onot", $.identifier),
			    seq ($.ck, "on", $.constructor_or_bool, "(", $.identifier, ")")),

	when_ck: $ => choice ($.identifier,
			      seq ($.not, $.identifier),
			      seq ($.constructor_or_bool, "(", $.identifier, ")")),

	equs: $ => choice ($.equ,
			   seq ($.equ, ";", optional ($.equs))),

	block_let: $ => seq (optional (seq ("var", $.loc_params)), "let", optional ($.equs)),
	block_do: $ => seq (optional (seq ("var", $.loc_params)), "do", optional ($.equs)),

	var_in: $ => seq ("var", $.loc_params, "in"),

	equ: $ => choice(
	    seq ($.pat, $.equal, $.exp),
	    seq ("automaton", $.automaton_handlers, "end"),
	    seq ("switch", $.exp, optional ("|"), $.switch_handlers, "end"),
	    seq ("present", optional ("|"), $.present_handlers,
		    optional ( seq($.default, "do", optional ($.var_in), optional($.equs))),
		 "end"),
	    seq ("if", $.exp, "then", optional ($.var_in), optional ($.equs), $.else_,
		 optional ($.var_in), optional ($.equs), "end"),
	    seq ("reset", optional ($.var_in), optional ($.equs), "every", $.exp),
	    seq ("do", optional ($.var_in), optional ($.equs), "done")),

	automaton_handler: $ => seq ("state", $._constructor, $.block_do,
				      optional ($.until_escapes), optional ($.unless_escapes)),

	automaton_handlers: $ => repeat1($.automaton_handler),

	until_escapes: $ => seq ("until", optional ("|"), $.escapes),

	unless_escapes: $ => seq ("unless", optional ("|"), $.escapes),

	escape: $ => seq ($.exp, choice("then", "continue"), $._constructor),

	escapes: $ => choice ($.escape,
			      seq ($.escapes, "|", $.escape)),

	switch_handler: $ => seq ($.constructor_or_bool, $.block_do),

	constructor_or_bool: $ => choice ($._bool, $.constructor),

	switch_handlers: $ => choice ($.switch_handler,
				      seq ($.switch_handlers, "|", $.switch_handler)),

	present_handler: $ => seq ($.exp, $.block_do),

	present_handlers: $ => choice ($.present_handler,
				       seq ($.present_handlers, "|", $.present_handler)),

	pat: $ => choice ($.identifier,
			  seq ("init", "<<", $.identifier, ">>", $.identifier),
			  seq ("(", optional ($.comma_sep_pat), ")")),

	comma_sep_pat: $ => choice ($.pat,
				    seq ($.comma_sep_pat, ",", $.pat)),

	opt_comma: _ => optional (","),

	exps: $ => choice (seq ($.exp, optional (",")),
				seq ($.exp, ",", $.exps)),

	simple_exp: $ => choice($._simple_exp,
				seq ("(", $.exp, optional ($.ct_annot), ")")),

	_simple_exp: $ => choice($.identifier,
				 $.const_,
				 seq ("{", $.field_exp_list, "}"),
				 seq ("[", $.array_exp_list, "]"),
				 seq ("(", $.tuple_exp, ")"),
				 seq ($.simple_exp, ".", $.qualname)),

	node_name: $ => seq (optional ("inlined"), $.qualname, optional ($.call_params)),

	merge_handlers: $ => choice (repeat1 ($.merge_handler),
				     seq ($.simple_exp, $.simple_exp)),

	merge_handler: $ => seq ("(", $.constructor_or_bool, $.arrow, $.exp, ")"),

	exp: $ => choice ( $.simple_exp,
			   prec.right (12, seq ($.simple_exp, $.fby, $.exp)),
			   prec.right (14, seq ($.pre, $.exp)),
			   seq ($.node_name, "(", optional ($.exps), ")"),
			   seq ("split", $.identifier, "(", $.exp, ")"),
			   prec.right (12, seq ($.not, $.exp)),
			   prec.right (9, seq ($.exp, $.when, $.constructor_or_bool, "(", $.identifier, ")")),
			   prec.right (9, seq ($.exp, $.when, $.identifier)), 
			   prec.right (9, seq ($.exp, $.whenot, $.identifier)),
			   prec.right (9, seq ($.exp, $.when, $.not, $.identifier)),
			   seq ("merge", $.identifier, $.merge_handlers),
			   prec.left (5, seq ($.exp, $.or, $.exp)),
			   prec.left (5, seq ($.exp, $.and, $.exp)),
			   prec.left (6, seq ($.exp, $.ampersand, $.exp)),
			   prec.left (7, seq ($.exp, $.less_greater, $.exp)),
			   prec.left (11, seq ($.exp, $.star, $.exp)),
			   prec.left (7, seq ($.exp, $.infix0, $.exp)),
			   prec.right (8, seq ($.exp, $.infix1, $.exp)),
			   prec.left (10, seq ($.exp, $.infix2, $.exp)),
			   prec.left (10, seq ($.exp, $._substractive, $.exp)),
			   prec.left (11, seq ($.exp, $.infix3, $.exp)),
			   prec.left (12, seq ($.exp, $.infix4, $.exp)),
			   prec (16, seq ($.prefix, $.exp)),
			   prec.left (10, seq ($._substractive, $.exp)),
			   seq ("if", $.exp, "then", $.exp, $.else_, $.exp),
			   prec.right (4, seq ($.simple_exp, $.arrow, $.exp)),
			   seq ("last", $.identifier),
			   prec.left (15, seq ($.exp, repeat1 (seq ($.power, $.simple_exp)))),
			   seq ($.simple_exp, $.indexes),
			   seq ($.simple_exp, ".", $.indexes, $.default, $.exp),
			   seq ($.simple_exp, $.trunc_indexes),
			   seq ("[", $.exp, "with", $.indexes, $.equal, $.exp, "]"),
			   seq ($.simple_exp, "[", $.exp, "..", $.exp, "]"),
			   prec.right (1, seq ($.exp, $.arobase, $.exp)),
			   seq ($.iterator, "<<", $.comma_sep_list, ">>", $.qualname,
				"<(", optional ($.comma_sep_list), ")>", "(", optional ($.exps), ")"),
			   seq ($.iterator, "<<", $.comma_sep_list, ">>", "(", $.qualname, "<<",
				$.array_exp_list, ">>", ")", "<(", optional ($.comma_sep_list), ")>",
				"(", optional ($.exps), ")"),
			   seq ("{", $.simple_exp, "with", ".", $.qualname, $.equal, $.exp, "}")),

	comma_sep_list: $ => seq ($.simple_exp, repeat (seq (",", $.simple_exp))),

	call_params: $ => seq ("<<", $.array_exp_list, ">>"),

	iterator: _ => choice ("map", "fold", "foldi", "mapi", "mapfold"),

	indexes: $ => repeat1 (seq ("[", $.exp, "]")),

	trunc_indexes: $ => repeat1 (seq ("[>", $.exp, "<]")),

	qualified_ident: $ => seq ($.modul, ".", $.identifier),

	qualified_ctor: $ => seq ($.modul, ".", $._constructor),

	modul: $ => choice ($._constructor,
	                    seq (field ("qualifier", $.modul), ".", field ("module", $._constructor))),

	constructor: $ => prec(1, choice ($._constructor, $.qualified_ctor)),

	qualname: $ => choice ($.identifier, $.qualified_ident),

	const_: $ => $._const,

	_const: $ => prec(1, choice ($.int, $.float, $.string, $.constructor_or_bool, $.qualified_ident)),

	tuple_exp: $ => choice (seq ($.exp, ",", $.exp),
				seq ($.exp, ",", $.tuple_exp)),

	field_exp_list: $ => choice ($.field_exp,
				     seq ($.field_exp_list, ";", $.field_exp)),

	array_exp_list: $ => choice ($.exp,
				     seq ($.array_exp_list, ",", $.exp)),

	field_exp: $ => seq ($.qualname, $.equal, $.exp),

	interface_desc: $ => choice ($.type_dec,
				     $.const_dec,
				     seq (optional ("external"), optional ("unsafe"), optional ("val"),
					  $.node_or_fun, $.identifier, optional ($.node_params), 
					  "(", optional ($.params_signature), ")", $.returns,
					  "(", optional ($.params_signature), ")")),

	params_signature: $ => choice ($.param_signature,
				       seq ($.params_signature, ",", $.param_signature)),

	param_signature: $ => choice (seq ($.identifier, ":", $.located_ty_ident, optional ($.sig_ck_annot)),
				      seq ($.located_ty_ident, optional ($.sig_ck_annot)),
				      seq ("...", optional ($.sig_ck_annot))),

	prefix: _ => prec(16, /[=<>&|$][!$%&*+\-./:<=>?@^|~]*/),

	infix0: _ => prec.left (7, /[=<>|&$][!$%&*+\-./:<=>?@^|~]*/),
	infix1: _ => prec.right (8, /[@^][!$%&*+\-./:<=>?@^|~]*/),
	infix2: _ => prec.left (10, choice(
	    /[+\-][!$%&*+\-./:<=>?@^|~]*/,
	    "lor", "xor")),
	infix3: _ => prec.left (11, choice(
	    /[*/%][!$%&*+\-./:<=>?@^|~]*/,
	    "quo", "mod", "land")),
	infix4: _ => prec.left (12, choice(
	    /\*\*[!$%&*+\-./:<=>?@^|~]*/,
	    "lsl", "lsr", "asr")),
	_substractive: _ => prec.left (10, choice ("-.", "-")),

	_bool: _ => choice ("true", "false"),
	int: _ => choice (
	    /[0-9]+/,
	    /0[xX][0-9A-Fa-f]+/,
	    /0[oO][0-7]+/,
	    /0[bB][0-1]+/),
	float: _ => /[0-9]+(\.[0-9]+)?([eE][+\-]?[0-9]+)?/
    },
    externals: $ => [
	$.comment,
    ],

})
