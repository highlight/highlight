grammar SearchGrammar;

search_query
  : EOF
  | search_expr EOF
  ;

col_expr
  : LPAREN col_expr RPAREN
  | col_expr AND col_expr
  | col_expr OR col_expr
  | NOT col_expr
  | STRING
  | ID
  ;

search_expr
  : LPAREN search_expr RPAREN
  | LPAREN search_expr RPAREN
  | search_expr AND search_expr
  | search_expr search_expr
  | search_expr OR search_expr
  | NOT search_expr
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
