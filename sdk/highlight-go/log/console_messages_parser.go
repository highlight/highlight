package hlog

import (
	"encoding/json"
	"strconv"

	e "github.com/pkg/errors"
	log "github.com/sirupsen/logrus"
)

type MessageTrace struct {
	ColumnNumber any    `json:"columnNumber"`
	LineNumber   any    `json:"lineNumber"`
	FileName     string `json:"fileName"`
	FunctionName string `json:"functionName,omitempty"`
	Source       string `json:"source"`
}

type Message struct {
	Type          string         `json:"type"`
	Trace         []MessageTrace `json:"trace"`
	Value         []string       `json:"value"`
	AttributesRaw any            `json:"attributes"`
	Time          int64          `json:"time"`
	Attributes    map[string]any
}

type Messages struct {
	Messages []Message `json:"messages"`
}

func ParseConsoleMessages(messages string) ([]*Message, error) {
	messagesParsed := Messages{}
	if err := json.Unmarshal([]byte(messages), &messagesParsed); err != nil {
		return nil, e.Wrap(err, "error decoding message data")
	}

	var rows []*Message
	for _, message := range messagesParsed.Messages {
		msg := &Message{
			Type:          message.Type,
			Trace:         message.Trace,
			Time:          message.Time,
			AttributesRaw: message.AttributesRaw,
			Attributes:    map[string]any{},
		}
		if attrString, ok := message.AttributesRaw.(string); ok && attrString != "" {
			if err := json.Unmarshal([]byte(attrString), &msg.Attributes); err != nil {
				log.WithField("attributes.raw", message.AttributesRaw).WithError(err).Warn("error decoding message attributes")
				msg.Attributes["attributes.raw"] = message.AttributesRaw
			}
		} else {
			log.WithField("attributes.raw", message.AttributesRaw).Warn("unknown console message attribute format")
			msg.Attributes["attributes.raw"] = message.AttributesRaw
		}
		var messageValue []string
		for _, v := range message.Value {
			value, err := strconv.Unquote(v)
			if err != nil {
				value = v
			}
			attrs := map[string]any{}
			if err := json.Unmarshal([]byte(value), &attrs); err == nil {
				for k, v := range attrs {
					msg.Attributes[k] = v
				}
			}
			messageValue = append(messageValue, value)
		}
		msg.Value = messageValue
		rows = append(rows, msg)
	}
	return rows, nil
}
