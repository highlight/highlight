grammar SearchGrammar;

search_query
  : EOF
  | search_expr EOF
  ;

col_expr
  : LPAREN col_expr RPAREN
  | search_value search_op search_value
  | search_value search_op search_value
  | negation_op col_expr
  | search_value
  ;

search_expr
  : LPAREN search_expr RPAREN
  | LPAREN search_expr RPAREN
  | search_expr search_op search_expr
  | search_expr search_expr
  | search_expr search_op search_expr
  | negation_op search_expr
  | search_key bin_op col_expr
  | col_expr
  ;

search_key
  : ID
  ;

search_op
  : AND
  | OR
  ;

negation_op
  : NOT
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

search_value
  : ID
  | STRING
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
LPAREN : '(' ;
RPAREN : ')' ;
COLON : ':' ;
ID : [a-zA-Z_0-9.\-*]+ ;
STRING : '"'.*?'"' ;
WS : [ \t\n\r\f]+ -> skip ;
