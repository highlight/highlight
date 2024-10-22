package listener

import (
	"fmt"
	"regexp"
	"strconv"
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

type SearchListener struct {
	parser.SearchGrammarListener

	currentKey       string
	currentOp        string
	rules            []string
	ops              Filters
	sb               *sqlbuilder.SelectBuilder
	attributesColumn string
	attributesList   bool
	tableConfig      model.TableConfig
	IgnoredFilters   map[string]string
}

func (s *SearchListener) GetFilters() Filters {
	return s.ops
}

func NewSearchListener(sqlBuilder *sqlbuilder.SelectBuilder, tableConfig model.TableConfig) *SearchListener {
	return &SearchListener{
		currentKey:       tableConfig.TableName,
		currentOp:        "=",
		rules:            []string{},
		ops:              []*FilterOperation{},
		sb:               sqlBuilder,
		attributesColumn: tableConfig.AttributesColumn,
		attributesList:   tableConfig.AttributesTable != "",
		tableConfig:      tableConfig,
		IgnoredFilters:   map[string]string{},
	}
}

func (s *SearchListener) getAttributeFilterExpr(op Operator, value any) sqlbuilder.Builder {
	var prefix, postfix string
	if op == OperatorGreaterThan || op == OperatorGreaterThanOrEqualTo ||
		op == OperatorLessThan || op == OperatorLessThanOrEqualTo {
		prefix = "toFloat64OrNull("
		postfix = ")"
	}
	if s.attributesList {
		// For NOT EXISTS queries, return true if there is no matching key in the array.
		if value == "" {
			return sqlbuilder.Buildf(fmt.Sprintf("empty(arrayFilter((k, v) -> k = %%s, %s))", s.attributesColumn), s.currentKey)
		} else {
			return sqlbuilder.Buildf(fmt.Sprintf("notEmpty(arrayFilter((k, v) -> k = %%s AND %sv%s %s %%s, %s))", prefix, postfix, op, s.attributesColumn), s.currentKey, value)
		}
	}
	return sqlbuilder.Buildf(prefix+s.attributesColumn+fmt.Sprintf("[%%s]%s %s %%s", postfix, op), s.currentKey, value)
}

func (s *SearchListener) EnterSearch_query(ctx *parser.Search_queryContext) {}
func (s *SearchListener) ExitSearch_query(ctx *parser.Search_queryContext) {
	s.sb.Where(s.rules...)
}

func (s *SearchListener) EnterTop_paren_col_expr(ctx *parser.Top_paren_col_exprContext) {}
func (s *SearchListener) ExitTop_paren_col_expr(ctx *parser.Top_paren_col_exprContext)  {}

func (s *SearchListener) EnterNegated_top_col_expr(ctx *parser.Negated_top_col_exprContext) {}
func (s *SearchListener) ExitNegated_top_col_expr(ctx *parser.Negated_top_col_exprContext)  {}

func (s *SearchListener) EnterTop_col_search_value(ctx *parser.Top_col_search_valueContext) {}
func (s *SearchListener) ExitTop_col_search_value(ctx *parser.Top_col_search_valueContext)  {}

func (s *SearchListener) EnterCol_paren_expr(ctx *parser.Col_paren_exprContext) {}
func (s *SearchListener) ExitCol_paren_expr(ctx *parser.Col_paren_exprContext)  {}

func (s *SearchListener) EnterNegated_col_expr(ctx *parser.Negated_col_exprContext) {}
func (s *SearchListener) ExitNegated_col_expr(ctx *parser.Negated_col_exprContext) {
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

func (s *SearchListener) EnterAnd_col_expr(ctx *parser.And_col_exprContext) {}
func (s *SearchListener) ExitAnd_col_expr(ctx *parser.And_col_exprContext) {
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

func (s *SearchListener) EnterOr_col_expr(ctx *parser.Or_col_exprContext) {}
func (s *SearchListener) ExitOr_col_expr(ctx *parser.Or_col_exprContext) {
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

func (s *SearchListener) EnterCol_search_value(ctx *parser.Col_search_valueContext) {}
func (s *SearchListener) ExitCol_search_value(ctx *parser.Col_search_valueContext)  {}

func (s *SearchListener) EnterNegated_search_expr(ctx *parser.Negated_search_exprContext) {}
func (s *SearchListener) ExitNegated_search_expr(ctx *parser.Negated_search_exprContext) {
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

func (s *SearchListener) EnterBody_search_expr(ctx *parser.Body_search_exprContext) {
	s.currentKey = s.tableConfig.BodyColumn
	s.currentOp = "="
}
func (s *SearchListener) ExitBody_search_expr(ctx *parser.Body_search_exprContext) {}

func (s *SearchListener) EnterExists_search_expr(ctx *parser.Exists_search_exprContext) {}
func (s *SearchListener) ExitExists_search_expr(ctx *parser.Exists_search_exprContext)  {}

func (s *SearchListener) EnterAnd_search_expr(ctx *parser.And_search_exprContext) {}
func (s *SearchListener) ExitAnd_search_expr(ctx *parser.And_search_exprContext) {
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

func (s *SearchListener) EnterImplicit_and_search_expr(ctx *parser.Implicit_and_search_exprContext) {
}
func (s *SearchListener) ExitImplicit_and_search_expr(ctx *parser.Implicit_and_search_exprContext) {
}

func (s *SearchListener) EnterOr_search_expr(ctx *parser.Or_search_exprContext) {}
func (s *SearchListener) ExitOr_search_expr(ctx *parser.Or_search_exprContext) {
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

func (s *SearchListener) EnterKey_val_search_expr(ctx *parser.Key_val_search_exprContext) {}
func (s *SearchListener) ExitKey_val_search_expr(ctx *parser.Key_val_search_exprContext) {
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

func (s *SearchListener) EnterParen_search_expr(ctx *parser.Paren_search_exprContext) {}
func (s *SearchListener) ExitParen_search_expr(ctx *parser.Paren_search_exprContext)  {}

func (s *SearchListener) EnterSearch_key(ctx *parser.Search_keyContext) {
	s.currentKey = ctx.GetText()
}
func (s *SearchListener) ExitSearch_key(ctx *parser.Search_keyContext) {}

func (s *SearchListener) EnterAnd_op(ctx *parser.And_opContext) {}
func (s *SearchListener) ExitAnd_op(ctx *parser.And_opContext)  {}

func (s *SearchListener) EnterOr_op(ctx *parser.Or_opContext) {}
func (s *SearchListener) ExitOr_op(ctx *parser.Or_opContext)  {}

func (s *SearchListener) EnterImplicit_and_op(ctx *parser.Implicit_and_opContext) {}
func (s *SearchListener) ExitImplicit_and_op(ctx *parser.Implicit_and_opContext)  {}

func (s *SearchListener) EnterNegation_op(ctx *parser.Negation_opContext) {}
func (s *SearchListener) ExitNegation_op(ctx *parser.Negation_opContext)  {}

func (s *SearchListener) EnterBin_op(ctx *parser.Bin_opContext) {
	s.currentOp = ctx.GetText()
}
func (s *SearchListener) ExitBin_op(ctx *parser.Bin_opContext) {}

func (s *SearchListener) EnterExists_op(ctx *parser.Exists_opContext) {}
func (s *SearchListener) ExitExists_op(ctx *parser.Exists_opContext) {
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

func (s *SearchListener) EnterSearch_value(ctx *parser.Search_valueContext) {
	s.appendRules(ctx.GetText())
}
func (s *SearchListener) ExitSearch_value(ctx *parser.Search_valueContext) {}

func (s *SearchListener) VisitTerminal(node antlr.TerminalNode)      {}
func (s *SearchListener) VisitErrorNode(node antlr.ErrorNode)        {}
func (s *SearchListener) EnterEveryRule(ctx antlr.ParserRuleContext) {}
func (s *SearchListener) ExitEveryRule(ctx antlr.ParserRuleContext)  {}

func (s *SearchListener) appendRules(value string) {
	if s.tableConfig.IgnoredFilters != nil && s.tableConfig.IgnoredFilters[s.currentKey] {
		s.IgnoredFilters[s.currentKey] = string(value)
		return
	}
	// Quotes are sometimes escaped on the client and need to be unescaped before
	// being used in the query or they will be double escaped.
	value = Unquote(value)

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

	extendedAttributeKey := false
	filterKey, ok := s.tableConfig.KeysToColumns[s.currentKey]
	if !ok {
		extendedAttributeKey = true
	}

	// Special case for non-string columns
	if value == "" && !extendedAttributeKey {
		filterKey = fmt.Sprintf("toString(%s)", filterKey)
	}

	if s.currentOp == ":" || s.currentOp == "=" || s.currentOp == "!=" {
		if strings.HasPrefix(value, "/") && strings.HasSuffix(value, "/") {
			value = strings.Trim(value, "/")
			if extendedAttributeKey {
				s.rules = append(s.rules, s.sb.Var(s.getAttributeFilterExpr(OperatorRegExp, value)))
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

			if extendedAttributeKey {
				s.rules = append(s.rules, s.sb.Var(s.getAttributeFilterExpr(OperatorILike, value)))
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
			if extendedAttributeKey {
				s.rules = append(s.rules, s.sb.Var(s.getAttributeFilterExpr(OperatorEqual, value)))
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
		numValue := NumericValue(value, filterKey)
		if extendedAttributeKey {
			s.rules = append(s.rules, s.sb.Var(s.getAttributeFilterExpr(OperatorGreaterThan, numValue)))
			s.ops = append(s.ops, &FilterOperation{
				Key:      s.currentKey,
				Column:   s.attributesColumn,
				Operator: OperatorGreaterThan,
				Values:   []string{numValue},
			})
		} else {
			s.rules = append(s.rules, s.sb.GreaterThan(filterKey, numValue))
			s.ops = append(s.ops, &FilterOperation{
				Key:      filterKey,
				Operator: OperatorGreaterThan,
				Values:   []string{numValue},
			})
		}
	} else if s.currentOp == ">=" {
		numValue := NumericValue(value, filterKey)
		if extendedAttributeKey {
			s.rules = append(s.rules, s.sb.Var(s.getAttributeFilterExpr(OperatorGreaterThanOrEqualTo, numValue)))
			s.ops = append(s.ops, &FilterOperation{
				Key:      s.currentKey,
				Column:   s.attributesColumn,
				Operator: OperatorGreaterThanOrEqualTo,
				Values:   []string{numValue},
			})
		} else {
			s.rules = append(s.rules, s.sb.GreaterEqualThan(filterKey, numValue))
			s.ops = append(s.ops, &FilterOperation{
				Key:      filterKey,
				Operator: OperatorGreaterThanOrEqualTo,
				Values:   []string{numValue},
			})
		}
	} else if s.currentOp == "<" {
		numValue := NumericValue(value, filterKey)
		if extendedAttributeKey {
			s.rules = append(s.rules, s.sb.Var(s.getAttributeFilterExpr(OperatorLessThan, numValue)))
			s.ops = append(s.ops, &FilterOperation{
				Key:      s.currentKey,
				Column:   s.attributesColumn,
				Operator: OperatorLessThan,
				Values:   []string{numValue},
			})
		} else {
			s.rules = append(s.rules, s.sb.LessThan(filterKey, numValue))
			s.ops = append(s.ops, &FilterOperation{
				Key:      filterKey,
				Operator: OperatorLessThan,
				Values:   []string{numValue},
			})
		}
	} else if s.currentOp == "<=" {
		numValue := NumericValue(value, filterKey)
		if extendedAttributeKey {
			s.rules = append(s.rules, s.sb.Var(s.getAttributeFilterExpr(OperatorLessThanOrEqualTo, numValue)))
			s.ops = append(s.ops, &FilterOperation{
				Key:      s.currentKey,
				Column:   s.attributesColumn,
				Operator: OperatorLessThanOrEqualTo,
				Values:   []string{numValue},
			})
		} else {
			s.rules = append(s.rules, s.sb.LessEqualThan(filterKey, numValue))
			s.ops = append(s.ops, &FilterOperation{
				Key:      filterKey,
				Operator: OperatorLessThanOrEqualTo,
				Values:   []string{numValue},
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

func Unquote(s string) string {
	if strings.HasPrefix(s, "\"") && strings.HasSuffix(s, "\"") {
		s = strings.Trim(s, "\"")
		s = strings.ReplaceAll(s, "\\\"", "\"")
	} else if strings.HasPrefix(s, "'") && strings.HasSuffix(s, "'") {
		s = strings.Trim(s, "'")
		s = strings.ReplaceAll(s, "\\'", "'")
	} else if strings.HasPrefix(s, "`") && strings.HasSuffix(s, "`") {
		s = strings.Trim(s, "`")
		s = strings.ReplaceAll(s, "\\`", "`")
	}

	return s
}

var suffixNanosecondFactor = map[string]int64{
	"h":  1e9 * 60 * 60,
	"m":  1e9 * 60,
	"s":  1e9,
	"ms": 1e6,
	"us": 1e3,
	"ns": 1,
}

var timeMetrics = map[string]string{
	"ActiveLength": "ms",
	"Length":       "ms",
	"Duration":     "ns",
}

// multiplies number by nanosecond factor and divide by base unit factor
// if key is not in nanoseconds
func NumericValue(value string, tableKey string) string {
	re := regexp.MustCompile(`^(\d+)([a-zA-Z]+)$`)
	matches := re.FindStringSubmatch(value)
	if len(matches) != 3 {
		return value
	}

	numString := matches[1]
	unit := matches[2]

	nanoMultiplier := suffixNanosecondFactor[strings.ToLower(unit)]
	if nanoMultiplier == 0 {
		return numString
	}

	num, err := strconv.ParseInt(numString, 10, 64)
	if err != nil {
		return numString
	}

	keyDivisor := suffixNanosecondFactor[baseUnit(tableKey)]
	if keyDivisor == 0 {
		keyDivisor = 1
	}

	return strconv.FormatInt(num*nanoMultiplier/keyDivisor, 10)
}

func baseUnit(tableKey string) string {
	unit := timeMetrics[tableKey]
	if unit == "" {
		unit = "ns"
	}

	return unit
}
