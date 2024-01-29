package listener

import (
	"fmt"
	"strings"
	"unicode"

	"github.com/antlr4-go/antlr/v4"
	"github.com/highlight-run/highlight/backend/model"
	parser "github.com/highlight-run/highlight/backend/parser/antlr"
	"github.com/huandu/go-sqlbuilder"
)

type searchListener[T ~string] struct {
	parser.SearchGrammarListener

	currentKey       string
	currentOp        string
	rules            []string
	sb               *sqlbuilder.SelectBuilder
	attributesColumn string
	tableConfig      model.TableConfig[T]
}

func NewSearchListener[T ~string](sqlBuilder *sqlbuilder.SelectBuilder, tableConfig model.TableConfig[T]) *searchListener[T] {
	return &searchListener[T]{
		currentKey:       tableConfig.TableName,
		currentOp:        "=",
		rules:            []string{},
		sb:               sqlBuilder,
		attributesColumn: tableConfig.AttributesColumn,
		tableConfig:      tableConfig,
	}
}

func (s *searchListener[T]) EnterSearch_query(ctx *parser.Search_queryContext) {}
func (s *searchListener[T]) ExitSearch_query(ctx *parser.Search_queryContext) {
	s.sb.Where(s.rules...)
}

func (s *searchListener[T]) EnterTop_paren_col_expr(ctx *parser.Top_paren_col_exprContext) {}
func (s *searchListener[T]) ExitTop_paren_col_expr(ctx *parser.Top_paren_col_exprContext)  {}

func (s *searchListener[T]) EnterNegated_top_col_expr(ctx *parser.Negated_top_col_exprContext) {}
func (s *searchListener[T]) ExitNegated_top_col_expr(ctx *parser.Negated_top_col_exprContext)  {}

func (s *searchListener[T]) EnterTop_col_search_value(ctx *parser.Top_col_search_valueContext) {}
func (s *searchListener[T]) ExitTop_col_search_value(ctx *parser.Top_col_search_valueContext)  {}

func (s *searchListener[T]) EnterCol_paren_expr(ctx *parser.Col_paren_exprContext) {}
func (s *searchListener[T]) ExitCol_paren_expr(ctx *parser.Col_paren_exprContext)  {}

func (s *searchListener[T]) EnterNegated_col_expr(ctx *parser.Negated_col_exprContext) {}
func (s *searchListener[T]) ExitNegated_col_expr(ctx *parser.Negated_col_exprContext) {
	rule := s.rules[len(s.rules)-1]
	s.rules = s.rules[:len(s.rules)-1]
	s.rules = append(s.rules, fmt.Sprintf("NOT (%s)", rule))
}

func (s *searchListener[T]) EnterAnd_col_expr(ctx *parser.And_col_exprContext) {}
func (s *searchListener[T]) ExitAnd_col_expr(ctx *parser.And_col_exprContext) {
	rules := s.rules[len(s.rules)-2:]
	s.rules = s.rules[:len(s.rules)-2]
	s.rules = append(s.rules, s.sb.And(rules...))
}

func (s *searchListener[T]) EnterOr_col_expr(ctx *parser.Or_col_exprContext) {}
func (s *searchListener[T]) ExitOr_col_expr(ctx *parser.Or_col_exprContext) {
	rules := s.rules[len(s.rules)-2:]
	s.rules = s.rules[:len(s.rules)-2]
	s.rules = append(s.rules, s.sb.Or(rules...))
}

func (s *searchListener[T]) EnterCol_search_value(ctx *parser.Col_search_valueContext) {}
func (s *searchListener[T]) ExitCol_search_value(ctx *parser.Col_search_valueContext)  {}

func (s *searchListener[T]) EnterNegated_search_expr(ctx *parser.Negated_search_exprContext) {}
func (s *searchListener[T]) ExitNegated_search_expr(ctx *parser.Negated_search_exprContext) {
	rule := s.rules[len(s.rules)-1]
	s.rules = s.rules[:len(s.rules)-1]
	s.rules = append(s.rules, fmt.Sprintf("NOT (%s)", rule))
}

func (s *searchListener[T]) EnterBody_search_expr(ctx *parser.Body_search_exprContext) {
	s.currentKey = s.tableConfig.BodyColumn
	s.currentOp = "="
}
func (s *searchListener[T]) ExitBody_search_expr(ctx *parser.Body_search_exprContext) {}

func (s *searchListener[T]) EnterExists_search_expr(ctx *parser.Exists_search_exprContext) {}
func (s *searchListener[T]) ExitExists_search_expr(ctx *parser.Exists_search_exprContext)  {}

func (s *searchListener[T]) EnterAnd_search_expr(ctx *parser.And_search_exprContext) {}
func (s *searchListener[T]) ExitAnd_search_expr(ctx *parser.And_search_exprContext) {
	rules := s.rules[len(s.rules)-2:]
	s.rules = s.rules[:len(s.rules)-2]
	s.rules = append(s.rules, s.sb.And(rules...))
}

func (s *searchListener[T]) EnterImplicit_and_search_expr(ctx *parser.Implicit_and_search_exprContext) {
}
func (s *searchListener[T]) ExitImplicit_and_search_expr(ctx *parser.Implicit_and_search_exprContext) {
}

func (s *searchListener[T]) EnterOr_search_expr(ctx *parser.Or_search_exprContext) {}
func (s *searchListener[T]) ExitOr_search_expr(ctx *parser.Or_search_exprContext) {
	rules := s.rules[len(s.rules)-2:]
	s.rules = s.rules[:len(s.rules)-2]
	s.rules = append(s.rules, s.sb.Or(rules...))
}

func (s *searchListener[T]) EnterKey_val_search_expr(ctx *parser.Key_val_search_exprContext) {}
func (s *searchListener[T]) ExitKey_val_search_expr(ctx *parser.Key_val_search_exprContext)  {}

func (s *searchListener[T]) EnterParen_search_expr(ctx *parser.Paren_search_exprContext) {}
func (s *searchListener[T]) ExitParen_search_expr(ctx *parser.Paren_search_exprContext)  {}

func (s *searchListener[T]) EnterSearch_key(ctx *parser.Search_keyContext) {
	s.currentKey = ctx.GetText()
}
func (s *searchListener[T]) ExitSearch_key(ctx *parser.Search_keyContext) {}

func (s *searchListener[T]) EnterAnd_op(ctx *parser.And_opContext) {}
func (s *searchListener[T]) ExitAnd_op(ctx *parser.And_opContext)  {}

func (s *searchListener[T]) EnterOr_op(ctx *parser.Or_opContext) {}
func (s *searchListener[T]) ExitOr_op(ctx *parser.Or_opContext)  {}

func (s *searchListener[T]) EnterImplicit_and_op(ctx *parser.Implicit_and_opContext) {}
func (s *searchListener[T]) ExitImplicit_and_op(ctx *parser.Implicit_and_opContext)  {}

func (s *searchListener[T]) EnterNegation_op(ctx *parser.Negation_opContext) {}
func (s *searchListener[T]) ExitNegation_op(ctx *parser.Negation_opContext)  {}

func (s *searchListener[T]) EnterBin_op(ctx *parser.Bin_opContext) {
	s.currentOp = ctx.GetText()
}
func (s *searchListener[T]) ExitBin_op(ctx *parser.Bin_opContext) {}

func (s *searchListener[T]) EnterExists_op(ctx *parser.Exists_opContext) {}
func (s *searchListener[T]) ExitExists_op(ctx *parser.Exists_opContext) {
	op := strings.ToUpper(ctx.GetText())
	switch op {
	case "EXISTS":
		s.currentOp = "!="
	case "NOTEXISTS":
		s.currentOp = "="
	default:
		fmt.Printf("Unknown exists operator: %s\n", op)
	}

	s.appendRules("")
}

func (s *searchListener[T]) EnterSearch_value(ctx *parser.Search_valueContext) {
	value := strings.Trim(ctx.GetText(), "\"")
	s.appendRules(value)
}
func (s *searchListener[T]) ExitSearch_value(ctx *parser.Search_valueContext) {}

func (s *searchListener[T]) VisitTerminal(node antlr.TerminalNode)      {}
func (s *searchListener[T]) VisitErrorNode(node antlr.ErrorNode)        {}
func (s *searchListener[T]) EnterEveryRule(ctx antlr.ParserRuleContext) {}
func (s *searchListener[T]) ExitEveryRule(ctx antlr.ParserRuleContext)  {}

func (s *searchListener[T]) appendRules(value string) {
	// Body column filters
	if s.currentKey == s.tableConfig.BodyColumn {
		if strings.Contains(value, "*") {
			if strings.HasPrefix(value, "*") {
				value = "%" + value[1:]
			}
			if strings.HasSuffix(value, "*") {
				value = value[:len(value)-1] + "%"
			}

			s.rules = append(s.rules, s.tableConfig.BodyColumn+" ILIKE "+s.sb.Var(value))
		} else {
			values := strings.FieldsFunc(value, isSeparator)
			for _, v := range values {
				s.rules = append(s.rules, "hasTokenCaseInsensitive("+s.tableConfig.BodyColumn+", "+s.sb.Var(v)+")")
			}
		}

		return
	}

	traceAttributeKey := false
	filterKey, ok := s.tableConfig.KeysToColumns[T(s.currentKey)]
	if !ok {
		traceAttributeKey = true
	}

	// Special case for non-string columns
	if value == "" && !traceAttributeKey {
		filterKey = fmt.Sprintf("toString(%s)", filterKey)
	}

	if s.currentOp == ":" || s.currentOp == "=" {
		if strings.Contains(value, "*") {
			value = wildcardValue(value)

			if traceAttributeKey {
				s.rules = append(s.rules, s.sb.Var(sqlbuilder.Buildf(s.attributesColumn+"[%s] LIKE %s", s.currentKey, value)))
			} else {
				s.rules = append(s.rules, s.sb.Like(filterKey, value))
			}
		} else {
			if traceAttributeKey {
				s.rules = append(s.rules, s.sb.Var(sqlbuilder.Buildf(s.attributesColumn+"[%s] = %s", s.currentKey, value)))
			} else {
				s.rules = append(s.rules, s.sb.Equal(filterKey, value))
			}
		}
	} else if s.currentOp == "!=" {
		if strings.Contains(value, "*") {
			value = wildcardValue(value)

			if traceAttributeKey {
				s.rules = append(s.rules, s.sb.Var(sqlbuilder.Buildf(s.attributesColumn+"[%s] NOT LIKE %s", s.currentKey, value)))
			} else {
				s.rules = append(s.rules, s.sb.NotLike(filterKey, value))
			}
		} else {
			if traceAttributeKey {
				s.rules = append(s.rules, s.sb.Var(sqlbuilder.Buildf(s.attributesColumn+"[%s] <> %s", s.currentKey, value)))
			} else {
				s.rules = append(s.rules, s.sb.NotEqual(filterKey, value))
			}
		}
	} else if s.currentOp == ">" {
		if traceAttributeKey {
			s.rules = append(s.rules, s.sb.Var(sqlbuilder.Buildf("toFloat64OrNull("+s.attributesColumn+"[%s]) > %s", s.currentKey, value)))
		} else {
			s.rules = append(s.rules, s.sb.GreaterThan(filterKey, value))
		}
	} else if s.currentOp == ">=" {
		if traceAttributeKey {
			s.rules = append(s.rules, s.sb.Var(sqlbuilder.Buildf("toFloat64OrNull("+s.attributesColumn+"[%s]) >= %s", s.currentKey, value)))
		} else {
			s.rules = append(s.rules, s.sb.GreaterEqualThan(filterKey, value))
		}
	} else if s.currentOp == "<" {
		if traceAttributeKey {
			s.rules = append(s.rules, s.sb.Var(sqlbuilder.Buildf("toFloat64OrNull("+s.attributesColumn+"[%s]) < %s", s.currentKey, value)))
		} else {
			s.rules = append(s.rules, s.sb.LessThan(filterKey, value))
		}
	} else if s.currentOp == "<=" {
		if traceAttributeKey {
			s.rules = append(s.rules, s.sb.Var(sqlbuilder.Buildf("toFloat64OrNull("+s.attributesColumn+"[%s]) <= %s", s.currentKey, value)))
		} else {
			s.rules = append(s.rules, s.sb.LessEqualThan(filterKey, value))
		}
	} else {
		fmt.Printf("Unknown search operator: %s\n", s.currentOp)
	}
}

func wildcardValue(value string) string {
	if strings.HasPrefix(value, "*") {
		value = "%" + value[1:]
	}

	if strings.HasSuffix(value, "*") {
		value = value[:len(value)-1] + "%"
	}

	return value
}

func isSeparator(r rune) bool {
	return !unicode.IsLetter(r) && !unicode.IsDigit(r)
}
