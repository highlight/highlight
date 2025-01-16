package clickhouse

// func TestSqlReplacement(t *testing.T) {
// 	query := "SELECT col1 * col2, (select 1 from table99 as table_alias) as col_alias, 3 * func(col2 * 3) FROM table1 t inner join table2 WHERE func(col2 * 3) is not null AND 1=1 GROUP BY t.col2 ORDER BY 1 LIMIT 100 OFFSET 2"
// 	// query := "SELECT (select ( select 1 from table))"
// 	// query := "SELECT 1 as test"
// 	tableReplacements := map[string]string{"table1": "replaced"}
// 	keysToColumns := map[string]string{"col2": "replaced"}
// 	columnMapping := []model.ColumnMapping{{Column: "TraceAttributes"}}
// 	builderFromSql(tableReplacements, keysToColumns, columnMapping, query, 1337)
// }
