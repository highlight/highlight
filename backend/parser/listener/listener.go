package listener

import (
	"fmt"
	"regexp"
	"strings"

	"github.com/antlr4-go/antlr/v4"
	"github.com/huandu/go-sqlbuilder"

	"github.com/highlight-run/highlight/backend/model"
	parser "github.com/highlight-run/highlight/backend/parser/antlr"
)

type Operator string

var OperatorEqual Operator = "="
var OperatorNotEqual Operator = "!="
var OperatorNot Operator = "NOT"
var OperatorLike Operator = "LIKE"
var OperatorILike Operator = "ILIKE"
var OperatorRegExp Operator = "REGEXP"
var OperatorContains Operator = "hasTokenCaseInsensitive"
var OperatorGreaterThan Operator = ">"
var OperatorGreaterThanOrEqualTo Operator = ">="
var OperatorLessThan Operator = "<"
var OperatorLessThanOrEqualTo Operator = "<="
var OperatorAnd Operator = "AND"
var OperatorOr Operator = "OR"

type FilterOperation struct {
	Column   string
	Key      string
	Operator Operator
	Filters  Filters
	Values   []string
}

type Filters []*FilterOperation

type searchListener[T ~string] struct {
	parser.SearchGrammarListener

	currentKey       string
	currentOp        string
	rules            []string
	ops              Filters
	sb               *sqlbuilder.SelectBuilder
	attributesColumn string
	tableConfig      model.TableConfig[T]
}

func (s *searchListener[T]) GetFilters() Filters {
	return s.ops
}

func NewSearchListener[T ~string](sqlBuilder *sqlbuilder.SelectBuilder, tableConfig model.TableConfig[T]) *searchListener[T] {
	return &searchListener[T]{
		currentKey:       tableConfig.TableName,
		currentOp:        "=",
		rules:            []string{},
		ops:              []*FilterOperation{},
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

	op := s.ops[len(s.ops)-1]
	s.ops = s.ops[:len(s.ops)-1]
	s.ops = append(s.ops, &FilterOperation{
		Operator: OperatorNot,
		Filters:  Filters{op},
	})
}

func (s *searchListener[T]) EnterAnd_col_expr(ctx *parser.And_col_exprContext) {}
func (s *searchListener[T]) ExitAnd_col_expr(ctx *parser.And_col_exprContext) {
	rules := s.rules[len(s.rules)-2:]
	s.rules = s.rules[:len(s.rules)-2]
	s.rules = append(s.rules, s.sb.And(rules...))

	ops := s.ops[len(s.ops)-2:]
	s.ops = s.ops[:len(s.ops)-2]
	s.ops = append(s.ops, &FilterOperation{
		Operator: OperatorAnd,
		Filters:  Filters{ops[0], ops[1]},
	})
}

func (s *searchListener[T]) EnterOr_col_expr(ctx *parser.Or_col_exprContext) {}
func (s *searchListener[T]) ExitOr_col_expr(ctx *parser.Or_col_exprContext) {
	rules := s.rules[len(s.rules)-2:]
	s.rules = s.rules[:len(s.rules)-2]
	s.rules = append(s.rules, s.sb.Or(rules...))

	ops := s.ops[len(s.ops)-2:]
	s.ops = s.ops[:len(s.ops)-2]
	s.ops = append(s.ops, &FilterOperation{
		Operator: OperatorOr,
		Filters:  Filters{ops[0], ops[1]},
	})
}

func (s *searchListener[T]) EnterCol_search_value(ctx *parser.Col_search_valueContext) {}
func (s *searchListener[T]) ExitCol_search_value(ctx *parser.Col_search_valueContext)  {}

func (s *searchListener[T]) EnterNegated_search_expr(ctx *parser.Negated_search_exprContext) {}
func (s *searchListener[T]) ExitNegated_search_expr(ctx *parser.Negated_search_exprContext) {
	rule := s.rules[len(s.rules)-1]
	s.rules = s.rules[:len(s.rules)-1]
	s.rules = append(s.rules, fmt.Sprintf("NOT (%s)", rule))

	op := s.ops[len(s.ops)-1]
	s.ops = s.ops[:len(s.ops)-1]
	s.ops = append(s.ops, &FilterOperation{
		Operator: OperatorNot,
		Filters:  Filters{op},
	})
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

	ops := s.ops[len(s.ops)-2:]
	s.ops = s.ops[:len(s.ops)-2]
	s.ops = append(s.ops, &FilterOperation{
		Operator: OperatorAnd,
		Filters:  Filters{ops[0], ops[1]},
	})
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

	ops := s.ops[len(s.ops)-2:]
	s.ops = s.ops[:len(s.ops)-2]
	s.ops = append(s.ops, &FilterOperation{
		Operator: OperatorOr,
		Filters:  Filters{ops[0], ops[1]},
	})
}

func (s *searchListener[T]) EnterKey_val_search_expr(ctx *parser.Key_val_search_exprContext) {}
func (s *searchListener[T]) ExitKey_val_search_expr(ctx *parser.Key_val_search_exprContext) {
	if s.currentOp == "!=" {
		rule := s.rules[len(s.rules)-1]
		s.rules = s.rules[:len(s.rules)-1]
		s.rules = append(s.rules, fmt.Sprintf("NOT (%s)", rule))

		op := s.ops[len(s.ops)-1]
		s.ops = s.ops[:len(s.ops)-1]
		s.ops = append(s.ops, &FilterOperation{
			Operator: OperatorNot,
			Filters:  Filters{op},
		})
	}
}

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

	if s.currentOp == "!=" {
		rule := s.rules[len(s.rules)-1]
		s.rules = s.rules[:len(s.rules)-1]
		s.rules = append(s.rules, fmt.Sprintf("NOT (%s)", rule))

		op := s.ops[len(s.ops)-1]
		s.ops = s.ops[:len(s.ops)-1]
		s.ops = append(s.ops, &FilterOperation{
			Operator: OperatorNot,
			Filters:  Filters{op},
		})
	}
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
		containsSpecialChars, _ := regexp.MatchString(`[^a-zA-Z0-9]`, value)

		if containsSpecialChars {
			value = wildcardValue(value)
			s.rules = append(s.rules, s.tableConfig.BodyColumn+" ILIKE "+s.sb.Var(value))
			s.ops = append(s.ops, &FilterOperation{
				Key:      s.tableConfig.BodyColumn,
				Operator: OperatorILike,
				Values:   []string{value},
			})
		} else {
			s.rules = append(s.rules, "hasTokenCaseInsensitive("+s.tableConfig.BodyColumn+", "+s.sb.Var(value)+")")
			s.ops = append(s.ops, &FilterOperation{
				Key:      s.tableConfig.BodyColumn,
				Operator: OperatorContains,
				Values:   []string{value},
			})
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

	if s.currentOp == ":" || s.currentOp == "=" || s.currentOp == "!=" {
		if strings.HasPrefix(value, "/") && strings.HasSuffix(value, "/") {
			value = strings.Trim(value, "/")
			if traceAttributeKey {
				s.rules = append(s.rules, s.sb.Var(sqlbuilder.Buildf(s.attributesColumn+"[%s] REGEXP %s", s.currentKey, value)))
				s.ops = append(s.ops, &FilterOperation{
					Key:      s.currentKey,
					Column:   s.attributesColumn,
					Operator: OperatorRegExp,
					Values:   []string{value},
				})
			} else {
				s.rules = append(s.rules, s.sb.Var(sqlbuilder.Buildf(filterKey+" REGEXP %s", value)))
				s.ops = append(s.ops, &FilterOperation{
					Key:      filterKey,
					Operator: OperatorRegExp,
					Values:   []string{value},
				})
			}
		} else if strings.Contains(value, "*") {
			value = wildcardValue(value)

			if traceAttributeKey {
				s.rules = append(s.rules, s.sb.Var(sqlbuilder.Buildf(s.attributesColumn+"[%s] ILIKE %s", s.currentKey, value)))
				s.ops = append(s.ops, &FilterOperation{
					Key:      s.currentKey,
					Column:   s.attributesColumn,
					Operator: OperatorLike,
					Values:   []string{value},
				})
			} else {
				s.rules = append(s.rules, s.sb.Var(sqlbuilder.Buildf(filterKey+" ILIKE %s", value)))
				s.ops = append(s.ops, &FilterOperation{
					Key:      filterKey,
					Operator: OperatorILike,
					Values:   []string{value},
				})
			}
		} else {
			if traceAttributeKey {
				s.rules = append(s.rules, s.sb.Var(sqlbuilder.Buildf(s.attributesColumn+"[%s] = %s", s.currentKey, value)))
				s.ops = append(s.ops, &FilterOperation{
					Key:      s.currentKey,
					Column:   s.attributesColumn,
					Operator: OperatorEqual,
					Values:   []string{value},
				})
			} else {
				s.rules = append(s.rules, s.sb.Equal(fmt.Sprintf("toString(%s)", filterKey), value))
				s.ops = append(s.ops, &FilterOperation{
					Key:      filterKey,
					Operator: OperatorEqual,
					Values:   []string{value},
				})
			}
		}
	} else if s.currentOp == ">" {
		if traceAttributeKey {
			s.rules = append(s.rules, s.sb.Var(sqlbuilder.Buildf("toFloat64OrNull("+s.attributesColumn+"[%s]) > %s", s.currentKey, value)))
			s.ops = append(s.ops, &FilterOperation{
				Key:      s.currentKey,
				Column:   s.attributesColumn,
				Operator: OperatorGreaterThan,
				Values:   []string{value},
			})
		} else {
			s.rules = append(s.rules, s.sb.GreaterThan(filterKey, value))
			s.ops = append(s.ops, &FilterOperation{
				Key:      filterKey,
				Operator: OperatorGreaterThan,
				Values:   []string{value},
			})
		}
	} else if s.currentOp == ">=" {
		if traceAttributeKey {
			s.rules = append(s.rules, s.sb.Var(sqlbuilder.Buildf("toFloat64OrNull("+s.attributesColumn+"[%s]) >= %s", s.currentKey, value)))
			s.ops = append(s.ops, &FilterOperation{
				Key:      s.currentKey,
				Column:   s.attributesColumn,
				Operator: OperatorGreaterThanOrEqualTo,
				Values:   []string{value},
			})
		} else {
			s.rules = append(s.rules, s.sb.GreaterEqualThan(filterKey, value))
			s.ops = append(s.ops, &FilterOperation{
				Key:      filterKey,
				Operator: OperatorGreaterThanOrEqualTo,
				Values:   []string{value},
			})
		}
	} else if s.currentOp == "<" {
		if traceAttributeKey {
			s.rules = append(s.rules, s.sb.Var(sqlbuilder.Buildf("toFloat64OrNull("+s.attributesColumn+"[%s]) < %s", s.currentKey, value)))
			s.ops = append(s.ops, &FilterOperation{
				Key:      s.currentKey,
				Column:   s.attributesColumn,
				Operator: OperatorLessThan,
				Values:   []string{value},
			})
		} else {
			s.rules = append(s.rules, s.sb.LessThan(filterKey, value))
			s.ops = append(s.ops, &FilterOperation{
				Key:      filterKey,
				Operator: OperatorLessThan,
				Values:   []string{value},
			})
		}
	} else if s.currentOp == "<=" {
		if traceAttributeKey {
			s.rules = append(s.rules, s.sb.Var(sqlbuilder.Buildf("toFloat64OrNull("+s.attributesColumn+"[%s]) <= %s", s.currentKey, value)))
			s.ops = append(s.ops, &FilterOperation{
				Key:      s.currentKey,
				Column:   s.attributesColumn,
				Operator: OperatorLessThanOrEqualTo,
				Values:   []string{value},
			})
		} else {
			s.rules = append(s.rules, s.sb.LessEqualThan(filterKey, value))
			s.ops = append(s.ops, &FilterOperation{
				Key:      filterKey,
				Operator: OperatorLessThanOrEqualTo,
				Values:   []string{value},
			})
		}
	} else {
		fmt.Printf("Unknown search operator: %s\n", s.currentOp)
	}
}

func wildcardValue(value string) string {
	value = strings.ReplaceAll(strings.ReplaceAll(value, "_", "\\_"), "*", "%")

	if !strings.HasPrefix(value, "%") {
		value = "%" + value
	}
	if !strings.HasSuffix(value, "%") {
		value = value + "%"
	}

	return value
}
