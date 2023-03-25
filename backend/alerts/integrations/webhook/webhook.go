package webhook

import (
	"encoding/json"
	"fmt"
	"github.com/hashicorp/go-retryablehttp"
	"github.com/highlight-run/highlight/backend/alerts/integrations"
	"github.com/highlight-run/highlight/backend/model"
	e "github.com/pkg/errors"
	"net/http"
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

func SendSessionFeedbackAlert(destination *model.WebhookDestination, payload *integrations.SessionFeedbackAlertPayload) error {
	body, err := json.Marshal(&struct {
		Event string
		*integrations.SessionFeedbackAlertPayload
	}{
		Event:                       model.AlertType.NEW_USER,
		SessionFeedbackAlertPayload: payload,
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
