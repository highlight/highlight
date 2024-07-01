package handlers

import (
	"context"
	"encoding/json"
	"github.com/aws/aws-lambda-go/events"
	"github.com/highlight-run/highlight/backend/env"
	"github.com/openlyinc/pointy"
	"github.com/pkg/errors"
	log "github.com/sirupsen/logrus"
	"gorm.io/gorm"

	"github.com/highlight-run/highlight/backend/model"
	"github.com/highlight-run/highlight/backend/pricing"
	model2 "github.com/highlight-run/highlight/backend/private-graph/graph/model"
)

type Handlers interface {
	HandleAWSMarketplaceSQS(context.Context, events.SQSEvent) error
}

type handlers struct {
	db *gorm.DB
}

func InitHandlers(db *gorm.DB) *handlers {
	return &handlers{
		db: db,
	}
}

func NewHandlers() *handlers {
	ctx := context.TODO()
	db, err := model.SetupDB(ctx, env.Config.SQLDatabase)
	if err != nil {
		log.WithContext(ctx).Fatal(errors.Wrap(err, "error setting up DB"))
	}

	return InitHandlers(db)
}

type subscriptionAction string

const subscribeSuccess subscriptionAction = "subscribe-success"
const unsubscribePending subscriptionAction = "unsubscribe-pending"
const unsubscribeSuccess subscriptionAction = "unsubscribe-success"
const subscribeFail subscriptionAction = "subscribe-fail"

type AWSMarketplaceSQSSubscriptionMessage struct {
	Action                 subscriptionAction `json:"action"`
	CustomerIdentifier     string             `json:"customer-identifier"`
	ProductCode            string             `json:"product-code"`
	OfferIdentifier        string             `json:"offer-identifier"`
	IsFreeTrialTermPresent string             `json:"isFreeTrialTermPresent"`
}

func (h *handlers) HandleAWSMarketplaceSQS(ctx context.Context, events events.SQSEvent) (err error) {
	for _, record := range events.Records {
		var msg AWSMarketplaceSQSSubscriptionMessage
		if err = json.Unmarshal([]byte(record.Body), &msg); err != nil {
			log.WithContext(ctx).WithField("body", record.Body).WithError(err).Error("failed to parse aws marketplace message")
			continue
		}
		log.WithContext(ctx).WithField("body", record.Body).WithField("msg", msg).Infof("received aws marketplace message")

		workspace := model.Workspace{}
		if err := h.db.WithContext(ctx).
			Model(&workspace).
			Joins("AWSMarketplaceCustomer").
			Where("customer_identifier = ?", pointy.String(msg.CustomerIdentifier)).
			Take(&workspace).
			Error; err != nil {
			return err
		}
		if pointy.StringValue(workspace.AWSMarketplaceCustomer.CustomerIdentifier, "invalid") != msg.CustomerIdentifier {
			log.WithContext(ctx).WithField("body", record.Body).Error("mismatched workspace customer identifier")
			continue
		}

		updates := map[string]interface{}{}
		if plan, ok := pricing.AWSMPProducts[msg.ProductCode]; msg.Action == subscribeSuccess && ok {
			updates["PlanTier"] = plan
		} else if msg.Action == subscribeFail || msg.Action == unsubscribePending || msg.Action == unsubscribeSuccess {
			updates["PlanTier"] = model2.PlanTypeFree
		}
		log.WithContext(ctx).WithField("workspaceID", workspace.ID).WithField("updates", updates).Info("updating workspace from aws marketplace subscription message")

		if err := h.db.WithContext(ctx).
			Model(&model.Workspace{}).
			Where("id = ?", workspace.ID).
			Updates(updates).Error; err != nil {
			return err
		}
	}
	return
}
