[
 "open"
 "const"
 "type"
 "returns"
 "unsafe"
 "node"
 "fun"
 "let"
 "tel"
 "contract"
 "assume"
 "enforce"
 "reachable"
 "attractive"
 "with"
 "last"
 "at"
 "var"
 "do"
 "in"
 "automaton"
 "switch"
 "present"
 "end"
 "if"
 "then"
 "else"
 "reset"
 "every"
 "done"
 "state"
 "until"
 "unless"
 "continue"
 "init"
 "inlined"
 "split"
 "merge"
 "external"
 "val"
 "default"
] @keyword

[
"@"
 "->"
 "or"
 "and"
 "&"
 "="
 "<>"
 "when"
 "whenot"
 "*"
 "not"
 "fby"
 "pre"
 "^"
 "::"
 "on"
 "onot"
 "|"
 "."
 (prefix)
 (infix0)
 (infix1)
 (infix2)
 (infix3)
 (infix4)
 "-"
 "-."
 "..."
] @operator

[
 "true"
 "false"
] @constant

[
 (float)
 (int)
] @number

[
 ";"
 ":"
 ","
] @punctuation.delimiter

(string) @string

(escape_sequence) @escape

(comment) @comment

(modul) @modul

(constructor) @constructor

(node_dec
  name: (identifier) @function)

(param
  (ident_list
    ((identifier) @parameter)))

(nonmt_out_params
  (var_last
    (ident_list
	((identifier) @var))))

(loc_params
  (var_last
    (ident_list
	((identifier) @var))))

(ty_ident) @type

(label_ty (identifier) @property)
(field_exp (qualname) @property)
(simple_exp (simple_exp) (qualname) @property)

(exp
  ((simple_exp) (qualname) @property (equal) (exp)))

["[" "]" "<<" ">>" "{" "}" "(" ")" "<(" ")>" "[>" "<]"] @punctuation.bracket


