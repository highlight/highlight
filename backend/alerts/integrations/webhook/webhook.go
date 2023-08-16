package webhook

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/hashicorp/go-retryablehttp"
	"github.com/highlight-run/highlight/backend/alerts/integrations"
	"github.com/highlight-run/highlight/backend/model"
	e "github.com/pkg/errors"
	log "github.com/sirupsen/logrus"
)

type ErrorAlertWebhook struct {
	Event string
	*integrations.ErrorAlertPayload
}

func sendWebhookData(destination *model.WebhookDestination, body []byte) error {
	resp, err := retryablehttp.Post(destination.URL, "application/json", body)
	if err != nil {
		return err
	}

	if resp.StatusCode >= http.StatusOK && resp.StatusCode < http.StatusMultipleChoices {
		logFields := log.Fields{}
		if err := json.Unmarshal(body, &logFields); err == nil {
			ctx := context.TODO()
			logFields["Destination"] = destination
			logFields["StatusCode"] = resp.StatusCode
			log.WithContext(ctx).WithFields(logFields).Info("webhook sent successfully")
		}

		return nil
	}

	return e.New(fmt.Sprintf("webhook %+v received unexpected response code %d", destination, resp.StatusCode))
}

func SendErrorAlert(destination *model.WebhookDestination, payload *integrations.ErrorAlertPayload) error {
	body, err := json.Marshal(&struct {
		Event string
		*integrations.ErrorAlertPayload
	}{
		Event:             model.AlertType.ERROR,
		ErrorAlertPayload: payload,
	})
	if err != nil {
		return err
	}
	return sendWebhookData(destination, body)
}

func SendNewUserAlert(destination *model.WebhookDestination, payload *integrations.NewUserAlertPayload) error {
	body, err := json.Marshal(&struct {
		Event string
		*integrations.NewUserAlertPayload
	}{
		Event:               model.AlertType.NEW_USER,
		NewUserAlertPayload: payload,
	})
	if err != nil {
		return err
	}
	return sendWebhookData(destination, body)
}

func SendNewSessionAlert(destination *model.WebhookDestination, payload *integrations.NewSessionAlertPayload) error {
	body, err := json.Marshal(&struct {
		Event string
		*integrations.NewSessionAlertPayload
	}{
		Event:                  model.AlertType.NEW_USER,
		NewSessionAlertPayload: payload,
	})
	if err != nil {
		return err
	}
	return sendWebhookData(destination, body)
}

func SendTrackPropertiesAlert(destination *model.WebhookDestination, payload *integrations.TrackPropertiesAlertPayload) error {
	body, err := json.Marshal(&struct {
		Event string
		*integrations.TrackPropertiesAlertPayload
	}{
		Event:                       model.AlertType.NEW_USER,
		TrackPropertiesAlertPayload: payload,
	})
	if err != nil {
		return err
	}
	return sendWebhookData(destination, body)
}

func SendUserPropertiesAlert(destination *model.WebhookDestination, payload *integrations.UserPropertiesAlertPayload) error {
	body, err := json.Marshal(&struct {
		Event string
		*integrations.UserPropertiesAlertPayload
	}{
		Event:                      model.AlertType.NEW_USER,
		UserPropertiesAlertPayload: payload,
	})
	if err != nil {
		return err
	}
	return sendWebhookData(destination, body)
}

func SendErrorFeedbackAlert(destination *model.WebhookDestination, payload *integrations.ErrorFeedbackAlertPayload) error {
	body, err := json.Marshal(&struct {
		Event string
		*integrations.ErrorFeedbackAlertPayload
	}{
		Event:                     model.AlertType.ERROR_FEEDBACK,
		ErrorFeedbackAlertPayload: payload,
	})
	if err != nil {
		return err
	}
	return sendWebhookData(destination, body)
}

func SendRageClicksAlert(destination *model.WebhookDestination, payload *integrations.RageClicksAlertPayload) error {
	body, err := json.Marshal(&struct {
		Event string
		*integrations.RageClicksAlertPayload
	}{
		Event:                  model.AlertType.NEW_USER,
		RageClicksAlertPayload: payload,
	})
	if err != nil {
		return err
	}
	return sendWebhookData(destination, body)
}

func SendMetricMonitorAlert(destination *model.WebhookDestination, payload *integrations.MetricMonitorAlertPayload) error {
	body, err := json.Marshal(&struct {
		Event string
		*integrations.MetricMonitorAlertPayload
	}{
		Event:                     model.AlertType.NEW_USER,
		MetricMonitorAlertPayload: payload,
	})
	if err != nil {
		return err
	}
	return sendWebhookData(destination, body)
}

func SendLogAlert(destination *model.WebhookDestination, payload *integrations.LogAlertPayload) error {
	body, err := json.Marshal(&struct {
		Event string
		*integrations.LogAlertPayload
	}{
		Event:           model.AlertType.LOG,
		LogAlertPayload: payload,
	})
	if err != nil {
		return err
	}
	return sendWebhookData(destination, body)
}
