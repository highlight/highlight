package error_tags

type MatchedErrorTag struct {
	Title       string  `json:"title"`
	Description string  `json:"description"`
	Score       float64 `json:"score"`
}
