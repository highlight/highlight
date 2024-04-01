grammar SearchGrammar;
options { caseInsensitive = true; }

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
  | col_expr AND col_expr # and_col_expr
  | col_expr OR col_expr # or_col_expr
  | search_value # col_search_value
  ;

search_expr
  : LPAREN search_expr RPAREN # paren_search_expr
  | negation_op search_expr # negated_search_expr
  | search_expr and_op search_expr # and_search_expr
  | search_expr or_op search_expr # or_search_expr
  | search_expr implicit_and_op search_expr # implicit_and_search_expr
  | search_key bin_op top_col_expr # key_val_search_expr
  | search_key exists_op # exists_search_expr
  | top_col_expr # body_search_expr
  ;

search_key
  : ID
  ;

and_op
  : AND
  ;

implicit_and_op
  :
  ;

or_op
  : OR
  ;

exists_op
  : EXISTS
  | NOT EXISTS
  ;

negation_op
  : NOT
  ;

bin_op
  // BANG is not a valid operator, but don't want it to produce a parsing error.
  : BANG
  | EQ
  | NEQ
  | GT
  | GTE
  | LT
  | LTE
  | COLON
  ;

search_value
  : STRING
  | ID
  | VALUE
  ;

AND : 'AND' ;
OR : 'OR' ;
NOT : 'NOT' ;
EXISTS : 'EXISTS' ;
BANG : '!' ;
EQ : '=' ;
NEQ : '!=' ;
LT : '<' ;
LTE : '<=' ;
GT : '>' ;
GTE : '>=' ;
LPAREN : '(' ;
RPAREN : ')' ;
COLON : ':' ;
ID : [A-Z_0-9.\-*]+ ;
STRING : ('"' ( '\\"' | ~["] )* '"' | '\'' ( '\\\'' | ~['] )* '\'') | '`' ( '\\`' | ~[`] )* '`' ;
VALUE: ~[ \t\n\r\f=><:!)(]+ ;
WS : [ \t\n\r\f]+ -> channel(HIDDEN) ;

// Handle characters which failed to match any other token. This ensures all
// characters are tokenized.
ERROR_CHARACTERS : . ;

