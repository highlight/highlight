grammar SearchGrammar;

search_query
  : EOF
  | spaces search_expr EOF
  ;

col_expr
  : LPAREN col_expr RPAREN
  | col_expr spaces AND spaces col_expr
  | col_expr spaces OR spaces col_expr
  | NOT col_expr
  | STRING
  | ID
  ;

search_expr
  : LPAREN search_expr RPAREN
  | LPAREN search_expr RPAREN
  | search_expr spaces AND spaces search_expr
  | search_expr spaces search_expr
  | search_expr spaces OR spaces search_expr
  | NOT spaces search_expr
  | search_key bin_op col_expr
  | col_expr
  ;

search_key
  : ID
  ;

bin_op
  : EQ
  | NEQ
  | GT
  | GTE
  | LT
  | LTE
  | COLON
  ;

spaces
  : WS*
  ;

AND : 'AND' ;
OR : 'OR' ;
NOT : 'NOT' ;
EQ : '=' ;
NEQ : '!=' ;
LT : '<' ;
LTE : '<=' ;
GT : '>' ;
GTE : '>=' ;
COMMA : ',' ;
SEMI : ';' ;
QUOT : '"' ;
LPAREN : '(' ;
RPAREN : ')' ;
LCURLY : '{' ;
RCURLY : '}' ;
COLON : ':' ;
ID : [a-zA-Z_0-9\-]+ ;
STRING : '"'.*?'"' ;
WS : [ \t\n\r\f]+ ;
