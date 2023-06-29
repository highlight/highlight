package hubspot

import (
	"context"
	log "github.com/sirupsen/logrus"
	"strconv"
	"time"
)

func MergeSimilarCompanies(ctx context.Context, h *HubspotApi) error {
	time.Sleep(time.Second * 10)
	results, objects, err := h.getDoppelgangers(ctx)
	if err != nil {
		return err
	}
	for _, result := range results {
		c1 := objects[result.ID1]
		c2 := objects[result.ID2]
		var c1Contacts, c1Sessions int64
		var c2Contacts, c2Sessions int64
		c1Contacts, _ = strconv.ParseInt(*c1.Properties["num_associated_contacts"].Value, 10, 64)
		if _, ok := c1.Properties["highlight_session_count"]; ok {
			c1Sessions, _ = strconv.ParseInt(*c1.Properties["highlight_session_count"].Value, 10, 64)
		}
		c2Contacts, _ = strconv.ParseInt(*c2.Properties["num_associated_contacts"].Value, 10, 64)
		if _, ok := c2.Properties["highlight_session_count"]; ok {
			c2Sessions, _ = strconv.ParseInt(*c2.Properties["highlight_session_count"].Value, 10, 64)
		}
		if c1Contacts > c2Contacts {
			Merge(ctx, h, c1, c2)
		} else if c2Contacts > c1Contacts {
			Merge(ctx, h, c2, c1)
		} else {
			if c1Sessions > c2Sessions {
				Merge(ctx, h, c1, c2)
			} else if c2Sessions > c1Sessions {
				Merge(ctx, h, c2, c1)
			} else {
				log.WithContext(ctx).Warnf("tie, cannot merge %+v %+v", *c1, *c2)
			}
		}
		log.WithContext(ctx).Infof("%d %d %+v %+v", c1Contacts, c2Contacts, *c1, *c2)
	}
	return nil
}

func Merge(ctx context.Context, h *HubspotApi, keep, merge *DoppelgangersObject) {
	log.WithContext(ctx).Infof("merging %d into %d", merge.ObjectID, keep.ObjectID)
	if err := h.mergeCompanies(keep.ObjectID, merge.ObjectID); err != nil {
		log.WithContext(ctx).WithError(err).Errorf("failed to merge %d into %d", merge.ObjectID, keep.ObjectID)
	}
}
