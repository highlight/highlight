package graph

import (
	"github.com/go-redis/redis/v8"
	"github.com/jinzhu/gorm"
	"github.com/olivere/elastic/v7"
)

// This file will not be regenerated automatically.
//
// It serves as dependency injection for your app, add any dependencies you require here.

type Resolver struct {
	DB      *gorm.DB
	Redis   *redis.Client
	Elastic *elastic.Client
}
