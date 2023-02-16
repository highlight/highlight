package zapier

import (
	"context"
	"net/http"

	resthooks "github.com/highlight-run/go-resthooks"
	model "github.com/highlight-run/highlight/backend/model"
	e "github.com/pkg/errors"
	log "github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

type ZapierResthookStore struct {
	DB *gorm.DB
}

func (s *ZapierResthookStore) Save(sub *resthooks.Subscription, r *http.Request) error {
	if r == nil {
		return e.New("request is nil")
	}
	parsedToken := r.Context().Value(model.ContextKeys.ZapierToken).(*ParsedZapierToken)
	sub.UserId = parsedToken.ProjectID

	subscription := model.ResthookSubscription{
		ProjectID: sub.UserId,
		Event:     &sub.Event,
		TargetUrl: &sub.TargetUrl,
	}

	existingSub, err := s.FindByUserId(sub.UserId, sub.Event)
	if err != nil {
		// the subscription does not exist yet, so create it
		if err := s.DB.Create(&subscription).Error; err != nil {
			return e.Wrap(err, "error saving resthook subscription to database")
		}

		sub.Id = subscription.ID
	} else {
		// the subscription already exists, so update it
		if err := s.DB.Where(&model.ResthookSubscription{Model: model.Model{ID: existingSub.Id}}).Updates(subscription).Error; err != nil {
			return e.Wrap(err, "error updating resthook subscription in database")
		}

		sub.Id = existingSub.Id
	}

	log.WithContext(context.TODO()).Infof("New Zapier subscription: %d; %s", sub.Id, sub.TargetUrl)
	return nil
}

func (s *ZapierResthookStore) FindById(id int) (*resthooks.Subscription, error) {
	hookSub := model.ResthookSubscription{}

	if err := s.DB.Where(&model.ResthookSubscription{Model: model.Model{ID: id}}).First(&hookSub).Error; err != nil {
		return nil, e.Wrap(err, "error finding resthook subscription by id")
	}

	sub := resthooks.Subscription{
		Id:        hookSub.ID,
		UserId:    hookSub.ProjectID,
		Event:     *hookSub.Event,
		TargetUrl: *hookSub.TargetUrl,
	}

	return &sub, nil
}

func (s *ZapierResthookStore) FindByUserId(project_id int, event string) (*resthooks.Subscription, error) {
	hookSub := model.ResthookSubscription{}

	if err := s.DB.Where(&model.ResthookSubscription{ProjectID: project_id, Event: &event}).First(&hookSub).Error; err != nil {
		return nil, e.Wrap(err, "error finding resthook subscription by event and project id")
	}

	sub := resthooks.Subscription{
		Id:        hookSub.ID,
		UserId:    hookSub.ProjectID,
		Event:     *hookSub.Event,
		TargetUrl: *hookSub.TargetUrl,
	}

	return &sub, nil
}

func (s *ZapierResthookStore) DeleteById(id int, r *http.Request) error {

	// if request is passed in, check if the user is authorized to delete the subscription
	// request could be nil as DeleteById is sometimes called by Notify and Notify does not pass in a request
	if r != nil {
		// there is right now a limitation where there can only be one subscription per event
		// TODO: modify the resthooks package to allow multiple subscriptions per event
		sub, err := s.FindById(id)
		if err != nil {
			return err
		}

		parsedToken := r.Context().Value(model.ContextKeys.ZapierProject).(*ParsedZapierToken)
		if parsedToken.ProjectID != sub.UserId {
			return e.New("Request is not authorized to delete this subscription")
		}
	}

	if err := s.DB.Delete(&model.ResthookSubscription{Model: model.Model{ID: id}}).Error; err != nil {
		return e.Wrap(err, "error deleting resthook subscription by id")
	}

	log.WithContext(context.TODO()).Infof("Deleting Zapier subscription: %d", id)
	return nil
}
