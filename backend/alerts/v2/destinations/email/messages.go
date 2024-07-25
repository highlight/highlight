package emailV2

import (
	"context"

	destinationsV2 "github.com/highlight-run/highlight/backend/alerts/v2/destinations"
	"github.com/highlight-run/highlight/backend/lambda"
	"github.com/highlight-run/highlight/backend/model"
	modelInputs "github.com/highlight-run/highlight/backend/private-graph/graph/model"
	log "github.com/sirupsen/logrus"
)

func SendAlerts(ctx context.Context, lambdaClient *lambda.Client, alertInput *destinationsV2.AlertInput, destinations []model.AlertDestination) {
	switch alertInput.Alert.ProductType {
	case modelInputs.ProductTypeSessions:
		sendSessionAlert(ctx, lambdaClient, alertInput, destinations)
	case modelInputs.ProductTypeErrors:
		sendErrorAlert(ctx, lambdaClient, alertInput, destinations)
	case modelInputs.ProductTypeLogs:
		sendLogAlert(ctx, lambdaClient, alertInput, destinations)
	case modelInputs.ProductTypeTraces:
		sendTraceAlert(ctx, lambdaClient, alertInput, destinations)
	case modelInputs.ProductTypeMetrics:
		sendMetricAlert(ctx, lambdaClient, alertInput, destinations)
	default:
		log.WithContext(ctx).WithFields(
			log.Fields{
				"alertID":          alertInput.Alert.ID,
				"alertProductType": alertInput.Alert.ProductType,
			}).Error("invalid product type")
	}
}

func sendSessionAlert(ctx context.Context, lambdaClient *lambda.Client, alertInput *destinationsV2.AlertInput, destinations []model.AlertDestination) {
	log.WithContext(ctx).WithFields(
		log.Fields{
			"alertID":          alertInput.Alert.ID,
			"alertProductType": alertInput.Alert.ProductType,
			"group":            alertInput.Group,
			"values":           alertInput.GroupValue,
		}).Info("sending v2 email notification")
}

func sendErrorAlert(ctx context.Context, lambdaClient *lambda.Client, alertInput *destinationsV2.AlertInput, destinations []model.AlertDestination) {
	log.WithContext(ctx).WithFields(
		log.Fields{
			"alertID":          alertInput.Alert.ID,
			"alertProductType": alertInput.Alert.ProductType,
			"group":            alertInput.Group,
			"values":           alertInput.GroupValue,
		}).Info("sending v2 email notification")
}

func sendLogAlert(ctx context.Context, lambdaClient *lambda.Client, alertInput *destinationsV2.AlertInput, destinations []model.AlertDestination) {
	log.WithContext(ctx).WithFields(
		log.Fields{
			"alertID":          alertInput.Alert.ID,
			"alertProductType": alertInput.Alert.ProductType,
			"group":            alertInput.Group,
			"values":           alertInput.GroupValue,
		}).Info("sending v2 email notification")
}

func sendTraceAlert(ctx context.Context, lambdaClient *lambda.Client, alertInput *destinationsV2.AlertInput, destinations []model.AlertDestination) {
	log.WithContext(ctx).WithFields(
		log.Fields{
			"alertID":          alertInput.Alert.ID,
			"alertProductType": alertInput.Alert.ProductType,
			"group":            alertInput.Group,
			"values":           alertInput.GroupValue,
		}).Info("sending v2 email notification")
}

func sendMetricAlert(ctx context.Context, lambdaClient *lambda.Client, alertInput *destinationsV2.AlertInput, destinations []model.AlertDestination) {
	log.WithContext(ctx).WithFields(
		log.Fields{
			"alertID":          alertInput.Alert.ID,
			"alertProductType": alertInput.Alert.ProductType,
			"group":            alertInput.Group,
			"values":           alertInput.GroupValue,
		}).Info("sending v2 email notification")
}
