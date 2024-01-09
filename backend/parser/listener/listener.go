package listener

import (
	"fmt"
	"strings"
	"unicode"

	"github.com/antlr4-go/antlr/v4"
	parser "github.com/highlight-run/highlight/backend/parser/antlr"
	"github.com/huandu/go-sqlbuilder"
)

type searchListener struct {
	parser.SearchGrammarListener

	currentKey       string
	currentOp        string
	rules            []string
	sb               *sqlbuilder.SelectBuilder
	bodyColumn       string
	attributesColumn string
	keysToColumns    map[string]string
}

func NewSearchListener(sqlBuilder *sqlbuilder.SelectBuilder, bodyColumn string, attributesColumn string, keysToColumns map[string]string) *searchListener {
	return &searchListener{
		currentKey:       bodyColumn,
		currentOp:        "=",
		rules:            []string{},
		sb:               sqlBuilder,
		bodyColumn:       bodyColumn,
		attributesColumn: attributesColumn,
		keysToColumns:    keysToColumns,
	}
}

func (s *searchListener) EnterSearch_query(ctx *parser.Search_queryContext) {}
func (s *searchListener) ExitSearch_query(ctx *parser.Search_queryContext) {
	s.sb.Where(s.rules...)
}

func (s *searchListener) EnterTop_paren_col_expr(ctx *parser.Top_paren_col_exprContext) {}
func (s *searchListener) ExitTop_paren_col_expr(ctx *parser.Top_paren_col_exprContext)  {}

func (s *searchListener) EnterNegated_top_col_expr(ctx *parser.Negated_top_col_exprContext) {}
func (s *searchListener) ExitNegated_top_col_expr(ctx *parser.Negated_top_col_exprContext)  {}

func (s *searchListener) EnterTop_col_search_value(ctx *parser.Top_col_search_valueContext) {}
func (s *searchListener) ExitTop_col_search_value(ctx *parser.Top_col_search_valueContext)  {}

func (s *searchListener) EnterCol_paren_expr(ctx *parser.Col_paren_exprContext) {}
func (s *searchListener) ExitCol_paren_expr(ctx *parser.Col_paren_exprContext)  {}

func (s *searchListener) EnterNegated_col_expr(ctx *parser.Negated_col_exprContext) {}
func (s *searchListener) ExitNegated_col_expr(ctx *parser.Negated_col_exprContext) {
	rule := s.rules[len(s.rules)-1]
	s.rules = s.rules[:len(s.rules)-1]
	s.rules = append(s.rules, fmt.Sprintf("NOT (%s)", rule))
}

func (s *searchListener) EnterAnd_col_expr(ctx *parser.And_col_exprContext) {}
func (s *searchListener) ExitAnd_col_expr(ctx *parser.And_col_exprContext) {
	rules := s.rules[len(s.rules)-2:]
	s.rules = s.rules[:len(s.rules)-2]
	s.rules = append(s.rules, s.sb.And(rules...))
}

func (s *searchListener) EnterOr_col_expr(ctx *parser.Or_col_exprContext) {}
func (s *searchListener) ExitOr_col_expr(ctx *parser.Or_col_exprContext) {
	rules := s.rules[len(s.rules)-2:]
	s.rules = s.rules[:len(s.rules)-2]
	s.rules = append(s.rules, s.sb.Or(rules...))
}

func (s *searchListener) EnterCol_search_value(ctx *parser.Col_search_valueContext) {}
func (s *searchListener) ExitCol_search_value(ctx *parser.Col_search_valueContext)  {}

func (s *searchListener) EnterNegated_search_expr(ctx *parser.Negated_search_exprContext) {}
func (s *searchListener) ExitNegated_search_expr(ctx *parser.Negated_search_exprContext) {
	rule := s.rules[len(s.rules)-1]
	s.rules = s.rules[:len(s.rules)-1]
	s.rules = append(s.rules, fmt.Sprintf("NOT (%s)", rule))
}

func (s *searchListener) EnterBody_search_expr(ctx *parser.Body_search_exprContext) {
	s.currentKey = s.bodyColumn
	s.currentOp = "="
}
func (s *searchListener) ExitBody_search_expr(ctx *parser.Body_search_exprContext) {}

func (s *searchListener) EnterAnd_search_expr(ctx *parser.And_search_exprContext) {}
func (s *searchListener) ExitAnd_search_expr(ctx *parser.And_search_exprContext) {
	rules := s.rules[len(s.rules)-2:]
	s.rules = s.rules[:len(s.rules)-2]
	s.rules = append(s.rules, s.sb.And(rules...))
}

func (s *searchListener) EnterImplicit_and_search_expr(ctx *parser.Implicit_and_search_exprContext) {}
func (s *searchListener) ExitImplicit_and_search_expr(ctx *parser.Implicit_and_search_exprContext)  {}

func (s *searchListener) EnterOr_search_expr(ctx *parser.Or_search_exprContext) {}
func (s *searchListener) ExitOr_search_expr(ctx *parser.Or_search_exprContext) {
	rules := s.rules[len(s.rules)-2:]
	s.rules = s.rules[:len(s.rules)-2]
	s.rules = append(s.rules, s.sb.Or(rules...))
}

func (s *searchListener) EnterKey_val_search_expr(ctx *parser.Key_val_search_exprContext) {}
func (s *searchListener) ExitKey_val_search_expr(ctx *parser.Key_val_search_exprContext)  {}

func (s *searchListener) EnterParen_search_expr(ctx *parser.Paren_search_exprContext) {}
func (s *searchListener) ExitParen_search_expr(ctx *parser.Paren_search_exprContext)  {}

func (s *searchListener) EnterSearch_key(ctx *parser.Search_keyContext) {
	s.currentKey = ctx.GetText()
}
func (s *searchListener) ExitSearch_key(ctx *parser.Search_keyContext) {}

func (s *searchListener) EnterAnd_op(ctx *parser.And_opContext) {}
func (s *searchListener) ExitAnd_op(ctx *parser.And_opContext)  {}

func (s *searchListener) EnterOr_op(ctx *parser.Or_opContext) {}
func (s *searchListener) ExitOr_op(ctx *parser.Or_opContext)  {}

func (s *searchListener) EnterNegation_op(ctx *parser.Negation_opContext) {}
func (s *searchListener) ExitNegation_op(ctx *parser.Negation_opContext)  {}

func (s *searchListener) EnterBin_op(ctx *parser.Bin_opContext) {
	s.currentOp = ctx.GetText()
}
func (s *searchListener) ExitBin_op(ctx *parser.Bin_opContext) {}

func (s *searchListener) EnterSearch_value(ctx *parser.Search_valueContext) {
	value := strings.Trim(ctx.GetText(), "\"")
	s.appendRules(value)
}
func (s *searchListener) ExitSearch_value(ctx *parser.Search_valueContext) {}

func (s *searchListener) VisitTerminal(node antlr.TerminalNode)      {}
func (s *searchListener) VisitErrorNode(node antlr.ErrorNode)        {}
func (s *searchListener) EnterEveryRule(ctx antlr.ParserRuleContext) {}
func (s *searchListener) ExitEveryRule(ctx antlr.ParserRuleContext)  {}

func (s *searchListener) appendRules(value string) {
	// Body column filters
	if s.currentKey == s.bodyColumn {
		if strings.Contains(value, "*") {
			if strings.HasPrefix(value, "*") {
				value = "%" + value[1:]
			}
			if strings.HasSuffix(value, "*") {
				value = value[:len(value)-1] + "%"
			}

			s.rules = append(s.rules, s.bodyColumn+" ILIKE "+s.sb.Var(value))
		} else {
			values := strings.FieldsFunc(value, isSeparator)
			for _, v := range values {
				s.rules = append(s.rules, "hasTokenCaseInsensitive("+s.bodyColumn+", "+s.sb.Var(v)+")")
			}
		}

		return
	}

	filterKey, ok := s.keysToColumns[s.currentKey]
	if !ok {
		filterKey = fmt.Sprintf("%s['%s']", s.attributesColumn, s.currentKey)
	}

	switch s.currentOp {
	case "=":
		if strings.Contains(value, "*") {
			value = strings.Replace(value, "*", "%", -1)
			s.rules = append(s.rules, s.sb.Like(filterKey, value))
		} else {
			s.rules = append(s.rules, s.sb.Equal(filterKey, value))
		}
	case ":":
		if strings.Contains(value, "*") {
			value = strings.Replace(value, "*", "%", -1)
			s.rules = append(s.rules, s.sb.Like(filterKey, value))
		} else {
			s.rules = append(s.rules, s.sb.Equal(filterKey, value))
		}
	case "!=":
		if strings.HasSuffix(value, "\"") && strings.Contains(value, "*") {
			value = strings.Replace(value, "*", "%", -1)
			s.rules = append(s.rules, s.sb.NotLike(filterKey, value))
		} else {
			s.rules = append(s.rules, s.sb.NotEqual(filterKey, value))
		}
	case ">":
		s.rules = append(s.rules, s.sb.GreaterThan(filterKey, value))
	case ">=":
		s.rules = append(s.rules, s.sb.GreaterEqualThan(filterKey, value))
	case "<":
		s.rules = append(s.rules, s.sb.LessThan(filterKey, value))
	case "<=":
		s.rules = append(s.rules, s.sb.LessEqualThan(filterKey, value))
	default:
		fmt.Printf("Unknown search operator: %s\n", s.currentOp)
	}
}

func isSeparator(r rune) bool {
	return !unicode.IsLetter(r) && !unicode.IsDigit(r)
}
