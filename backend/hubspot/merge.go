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
		var choice bool
		if c1.ObjectType == "COMPANY" && c2.ObjectType == "COMPANY" {
			choice = compareCompanies(ctx, c1, c2)
			if choice {
				MergeCompanies(ctx, h, c1, c2)
			} else {
				MergeCompanies(ctx, h, c2, c1)
			}
		} else if c1.ObjectType == "CONTACT" && c2.ObjectType == "CONTACT" {
			choice = compareContacts(ctx, c1, c2)
			if choice {
				MergeContacts(ctx, h, c1, c2)
			} else {
				MergeContacts(ctx, h, c2, c1)
			}
		} else {
			log.WithContext(ctx).Warnf("invalid object types %+v %+v", *c1, *c2)
		}
	}
	return nil
}

func compareContacts(ctx context.Context, c1, c2 *DoppelgangersObject) bool {
	var c1Company, c2Company string
	var c1HasCompany, c2HasCompany bool
	if _, c1HasCompany = c1.Properties["company"]; c1HasCompany {
		c1Company = *c1.Properties["company"].Value
	}
	if _, c2HasCompany = c2.Properties["company"]; c2HasCompany {
		c2Company = *c2.Properties["company"].Value
	}

	var c1SessionsViewed, c2SessionsViewed int64
	var c1HasSessionsViewed, c2HasSessionsViewed bool
	if _, c1HasSessionsViewed = c1.Properties["number_of_highlight_sessions_viewed"]; c1HasSessionsViewed {
		c1SessionsViewed, _ = strconv.ParseInt(*c1.Properties["number_of_highlight_sessions_viewed"].Value, 10, 64)
	}
	if _, c2HasSessionsViewed = c2.Properties["number_of_highlight_sessions_viewed"]; c2HasSessionsViewed {
		c2SessionsViewed, _ = strconv.ParseInt(*c2.Properties["number_of_highlight_sessions_viewed"].Value, 10, 64)
	}

	var c1LastUpdated, c2LastUpdated time.Time
	var c1HasLastUpdated, c2HasLastUpdated bool
	if _, c1HasLastUpdated = c1.Properties["notes_last_updated"]; c1HasLastUpdated {
		c1LastUpdated = time.UnixMilli(int64(*c1.Properties["notes_last_updated"].Timestamp))
	}
	if _, c2HasLastUpdated = c2.Properties["notes_last_updated"]; c2HasLastUpdated {
		c2LastUpdated = time.UnixMilli(int64(*c2.Properties["notes_last_updated"].Timestamp))
	}

	log.WithContext(ctx).Infof("%+v %+v %+v %+v %+v %+v %+v %+v", c1Company, c2Company, c1SessionsViewed, c2SessionsViewed, c1LastUpdated, c2LastUpdated, *c1, *c2)
	if c1SessionsViewed > c2SessionsViewed {
		return true
	} else if c2SessionsViewed > c1SessionsViewed {
		return false
	} else {
		if c1Company != "" && c2Company == "" {
			return true
		} else if c2Company != "" && c1Company == "" {
			return false
		} else {
			if c1LastUpdated.After(c2LastUpdated) {
				return true
			} else if c2LastUpdated.After(c1LastUpdated) {
				return false
			} else {
				log.WithContext(ctx).Warnf("tie, keeping %+v merging %+v", *c1, *c2)
				return true
			}
		}
	}
}

func compareCompanies(ctx context.Context, c1, c2 *DoppelgangersObject) bool {
	var c1Contacts, c1Sessions int64
	var c2Contacts, c2Sessions int64
	var c1HasSessions, c2HasSessions bool
	c1Contacts, _ = strconv.ParseInt(*c1.Properties["num_associated_contacts"].Value, 10, 64)
	if _, c1HasSessions = c1.Properties["highlight_session_count"]; c1HasSessions {
		c1Sessions, _ = strconv.ParseInt(*c1.Properties["highlight_session_count"].Value, 10, 64)
	}
	c2Contacts, _ = strconv.ParseInt(*c2.Properties["num_associated_contacts"].Value, 10, 64)
	if _, c2HasSessions = c2.Properties["highlight_session_count"]; c2HasSessions {
		c2Sessions, _ = strconv.ParseInt(*c2.Properties["highlight_session_count"].Value, 10, 64)
	}
	log.WithContext(ctx).Infof("%d %d %+v %+v", c1Contacts, c2Contacts, *c1, *c2)
	if c1Contacts > c2Contacts {
		return true
	} else if c2Contacts > c1Contacts {
		return false
	} else {
		if c1Sessions > c2Sessions {
			return true
		} else if c2Sessions > c1Sessions {
			return false
		} else {
			if c1HasSessions && !c2HasSessions {
				return true
			} else if c2HasSessions && !c1HasSessions {
				return false
			} else {
				log.WithContext(ctx).Warnf("tie, keeping %+v merging %+v", *c1, *c2)
				return true
			}
		}
	}
}

func MergeCompanies(ctx context.Context, h *HubspotApi, keep, merge *DoppelgangersObject) {
	log.WithContext(ctx).Infof("merging %d into %d", merge.ObjectID, keep.ObjectID)
	if err := h.mergeCompanies(keep.ObjectID, merge.ObjectID); err != nil {
		log.WithContext(ctx).WithError(err).Errorf("failed to merge %d into %d", merge.ObjectID, keep.ObjectID)
	}
}

func MergeContacts(ctx context.Context, h *HubspotApi, keep, merge *DoppelgangersObject) {
	log.WithContext(ctx).Infof("merging %d into %d", merge.ObjectID, keep.ObjectID)
	if err := h.mergeContacts(keep.ObjectID, merge.ObjectID); err != nil {
		log.WithContext(ctx).WithError(err).Errorf("failed to merge %d into %d", merge.ObjectID, keep.ObjectID)
	}
}
