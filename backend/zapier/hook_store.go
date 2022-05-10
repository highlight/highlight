package zapier

import (
	model "github.com/highlight-run/highlight/backend/model"
	resthooks "github.com/marconi/go-resthooks"
	log "github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

type ZapierResthookStore struct {
	db          *gorm.DB
	project     *model.Project
	parsedToken *ParsedZapierToken
}

// TODO actually implement
func (s *ZapierResthookStore) Save(sub *resthooks.Subscription) error {
	sub.UserId = s.parsedToken.ProjectID
	log.Infof("New Zapier subscription: %s", sub.TargetUrl)
	return nil
}

// TODO actually implement
func (s *ZapierResthookStore) FindById(int) (*resthooks.Subscription, error) {
	sub := resthooks.Subscription{}
	return &sub, nil
}

// TODO actually implement
func (s *ZapierResthookStore) FindByUserId(int, string) (*resthooks.Subscription, error) {
	sub := resthooks.Subscription{}
	return &sub, nil
}

// TODO actually implement
func (s *ZapierResthookStore) DeleteById(id int) error {
	log.Infof("Delete Zapier subscription: %d", id)
	return nil
}
