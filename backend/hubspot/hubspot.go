package hubspot

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	log "github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

var (
	OAuthToken = os.Getenv("HUBSPOT_OAUTH_TOKEN")
	APIKey     = os.Getenv("HUBSPOT_API_KEY")
	// CookieString and CSRFToken are reverse engineered from the frontend request flow.
	// they only need to be set for the doppelgänger functionality.
	CookieString = os.Getenv("HUBSPOT_COOKIE_STRING")
	CSRFToken    = os.Getenv("HUBSPOT_CSRF_TOKEN")
)

type Client struct {
	db *gorm.DB
}

type DoppelgangersPropertyVersion struct {
	Name      string `json:"name"`
	Source    string `json:"source"`
	SourceID  string `json:"sourceId"`
	SourceVid any    `json:"sourceVid"`
	Timestamp int    `json:"timestamp"`
	Value     string `json:"value"`
}

type DoppelgangersProperty struct {
	PersistenceTimestamp *int                            `json:"persistenceTimestamp"`
	Source               string                          `json:"source"`
	SourceID             string                          `json:"sourceId"`
	Timestamp            *int                            `json:"timestamp"`
	UpdatedByUserID      *int                            `json:"updatedByUserId"`
	Value                *string                         `json:"value"`
	Versions             []*DoppelgangersPropertyVersion `json:"versions"`
}

type DoppelgangersObject struct {
	ObjectType string                            `json:"objectType"`
	ObjectID   int                               `json:"objectId"`
	PortalID   int                               `json:"portalId"`
	Properties map[string]*DoppelgangersProperty `json:"properties"`
}

type DoppelgangersResult struct {
	FeedbackID      string  `json:"feedbackId"`
	ID1             int     `json:"id1"`
	ID2             int     `json:"id2"`
	SimilarityScore float64 `json:"similarityScore"`
}

type DoppelgangersUserSavedPropertyOption struct {
	DisplayOrder int    `json:"displayOrder"`
	Hidden       bool   `json:"hidden"`
	Label        string `json:"label"`
	ReadOnly     bool   `json:"readOnly"`
	Value        string `json:"value"`
}

type DoppelgangersUserSavedProperty struct {
	ExternalOptionsReferenceType *string                                 `json:"externalOptionsReferenceType"`
	FieldType                    string                                  `json:"fieldType"`
	Hidden                       bool                                    `json:"hidden"`
	HubspotDefined               bool                                    `json:"hubspotDefined"`
	Label                        string                                  `json:"label"`
	Name                         string                                  `json:"name"`
	Type                         string                                  `json:"type"`
	Options                      []*DoppelgangersUserSavedPropertyOption `json:"options"`
}

type DoppelgangersResponse struct {
	Results             []*DoppelgangersResult            `json:"results"`
	Objects             map[int]*DoppelgangersObject      `json:"objects"`
	UserSavedProperties []*DoppelgangersUserSavedProperty `json:"userSavedProperties"`
	HasMore             bool                              `json:"hasMore"`
	Offset              int                               `json:"offset"`
	Total               int                               `json:"total"`
	LastScoredTimestamp int64                             `json:"lastScoredTimestamp"`
}

type QSParam struct {
	key   string
	value string
}

func (h *Client) doRequest(ctx context.Context, url string, result interface{}, params []QSParam, method string, b io.Reader) error {
	for {
		req, _ := http.NewRequest(method, fmt.Sprintf("https://api.hubapi.com%s", url), b)
		req.Header.Add("Accept", "application/json")
		req.Header.Add("Content-Type", "application/json")
		req.Header.Add("Authorization", "Bearer "+OAuthToken)
		q := req.URL.Query()
		q.Add("hapikey", APIKey)
		for _, p := range params {
			q.Add(p.key, p.value)
		}
		// for doppelgänger requests
		if CookieString != "" {
			for _, s := range strings.Split(CookieString, "; ") {
				val := strings.Split(s, "=")
				k, v := val[0], val[1]
				req.AddCookie(&http.Cookie{Name: k, Value: v})
			}
		}
		// for doppelgänger requests
		if CSRFToken != "" {
			req.Header.Add("X-Hubspot-Csrf-Hubspotapi", CSRFToken)
		}
		req.URL.RawQuery = q.Encode()

		httpClient := http.Client{}
		resp, err := httpClient.Do(req)
		if err != nil {
			return err
		}
		defer func(Body io.ReadCloser) {
			_ = Body.Close()
		}(resp.Body)

		body, err := io.ReadAll(resp.Body)
		if err != nil {
			return err
		}

		if result != nil {
			err = json.Unmarshal(body, &result)
			if err != nil {
				return err
			}
		}

		if resp.StatusCode != 200 && resp.StatusCode != 204 {
			if resp.StatusCode == 429 && strings.Contains(string(body), "RATE_LIMIT") {
				log.WithContext(ctx).WithField("body", string(body)).Warn("hit hubspot rate limit")
				time.Sleep(10 * time.Second)
				continue
			}
			return fmt.Errorf("HubSpot API error: %d - %s \n%s", resp.StatusCode, resp.Status, string(body))
		}
		return nil
	}
}

func (h *Client) getDoppelgangers(ctx context.Context) (results []*DoppelgangersResult, objects map[int]*DoppelgangersObject, err error) {
	objects = make(map[int]*DoppelgangersObject)
	for {
		r := DoppelgangersResponse{}
		if err = h.doRequest(ctx, "/doppelganger/v1/similar/company/resultPage", &r, []QSParam{
			{key: "pageSize", value: "50"},
			{key: "offset", value: strconv.Itoa(len(results))},
			{key: "properties", value: "name"},
			{key: "properties", value: "domain"},
			{key: "properties", value: "hs_num_child_companies"},
			{key: "properties", value: "hs_parent_company_id"},
			{key: "properties", value: "hs_last_sales_activity_timestamp"},
			{key: "properties", value: "createdate"},
			{key: "properties", value: "hs_lastmodifieddate"},
			{key: "portalId", value: "20473940"},
		}, "GET", nil); err != nil {
			return
		} else {
			for k, v := range r.Objects {
				objects[k] = v
			}
			results = append(results, r.Results...)
			if !r.HasMore {
				break
			}
		}
	}

	for {
		r := DoppelgangersResponse{}
		if err = h.doRequest(ctx, "/doppelganger/v1/similar/contact/resultPage", &r, []QSParam{
			{key: "pageSize", value: "50"},
			{key: "offset", value: strconv.Itoa(len(results))},
			{key: "properties", value: "firstname"},
			{key: "properties", value: "lastname"},
			{key: "properties", value: "email"},
			{key: "properties", value: "jobtitle"},
			{key: "properties", value: "hs_sequences_is_enrolled"},
			{key: "properties", value: "hs_last_sales_activity_timestamp"},
			{key: "properties", value: "createdate"},
			{key: "properties", value: "lastmodifieddate"},
			{key: "portalId", value: "20473940"},
		}, "GET", nil); err != nil {
			return
		} else {
			for k, v := range r.Objects {
				objects[k] = v
			}
			results = append(results, r.Results...)
			if !r.HasMore {
				break
			}
		}
	}
	return
}

func (h *Client) mergeCompanies(keepID, mergeID int) error {
	return h.doRequest(context.TODO(), fmt.Sprintf("/companies/v2/companies/%d/merge", keepID), nil, []QSParam{
		{key: "portalId", value: "20473940"},
	}, "PUT", strings.NewReader(fmt.Sprintf(`{"companyIdToMerge":%d}`, mergeID)))
}

func (h *Client) mergeContacts(keepID, mergeID int) error {
	return h.doRequest(context.TODO(), fmt.Sprintf("/contacts/v1/contact/%d/merge", keepID), nil, []QSParam{
		{key: "portalId", value: "20473940"},
	}, "POST", strings.NewReader(fmt.Sprintf(`{"vidToMerge":%d}`, mergeID)))
}
