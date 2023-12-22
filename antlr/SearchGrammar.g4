grammar SearchGrammar;

search_query
  : EOF
  | search_expr EOF
  ;

top_col_expr
  : LPAREN col_expr RPAREN # top_paren_col_expr
  | negation_op top_col_expr # negated_top_col_expr
  | search_value # top_col_search_value
  ;


col_expr
  : LPAREN col_expr RPAREN # col_paren_expr
  | negation_op col_expr # negated_col_expr
  | col_expr and_op col_expr # and_col_expr
  | col_expr OR col_expr # or_col_expr
  | search_value # col_search_value
  ;

search_expr
  : LPAREN search_expr RPAREN # paren_search_expr
  | negation_op search_expr # negated_search_expr
  | search_expr and_op search_expr # and_search_expr
  | search_expr OR search_expr # or_search_expr
  | search_key bin_op top_col_expr # key_val_search_expr
  | top_col_expr # body_search_expr
  ;

search_key
  : ID
  ;

and_op
  : AND
  |
  ;

or_op
  : OR
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
  : ID # id_search_value
  | STRING # string_search_value
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
