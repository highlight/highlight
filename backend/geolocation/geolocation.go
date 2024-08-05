package geolocation

import (
	_ "embed"
)

//go:embed GeoLite2-City.mmdb
var GeoLiteCityMMDB []byte
