package worker

import (
	"context"
	"github.com/sendgrid/sendgrid-go"
	"io"
	"os"
	"testing"
	"time"

	"github.com/go-test/deep"
	"github.com/highlight-run/highlight/backend/clickhouse"
	parse "github.com/highlight-run/highlight/backend/event-parse"
	"github.com/highlight-run/highlight/backend/model"
	"github.com/highlight-run/highlight/backend/pricing"
	"github.com/highlight-run/highlight/backend/private-graph/graph"
	model2 "github.com/highlight-run/highlight/backend/private-graph/graph/model"
	"github.com/highlight-run/highlight/backend/redis"
	"github.com/highlight-run/highlight/backend/store"
	"github.com/highlight-run/highlight/backend/util"
	"github.com/openlyinc/pointy"
	e "github.com/pkg/errors"
	log "github.com/sirupsen/logrus"
	"github.com/stretchr/testify/assert"
	"gorm.io/gorm"
)

var DB *gorm.DB
var redisClient *redis.Client
var chClient *clickhouse.Client

// Gets run once; M.run() calls the tests in this file.
func TestMain(m *testing.M) {
	DB, _ = util.CreateAndMigrateTestDB("highlight_testing_db_worker")
	redisClient = redis.NewClient()
	chClient, _ = clickhouse.NewClient(clickhouse.TestDatabase)
	clickhouse.RunMigrations(context.TODO(), clickhouse.TestDatabase)
	code := m.Run()
	os.Exit(code)
}

func TestCalculateSessionLength(t *testing.T) {
	tables := map[string]struct {
		firstEvents    *parse.ReplayEvents
		lastEvents     *parse.ReplayEvents
		wantDifference time.Duration
	}{
		"one first event, no duration": {
			&parse.ReplayEvents{
				Events: []*parse.ReplayEvent{
					{
						SID:       1,
						Timestamp: time.Date(1970, time.Month(1), 1, 1, 0, 0, 0, time.UTC),
					},
				}},
			&parse.ReplayEvents{
				Events: []*parse.ReplayEvent{},
			},
			time.Duration(0 * time.Hour),
		},
		"two events, active duration": {
			&parse.ReplayEvents{
				Events: []*parse.ReplayEvent{
					{
						SID:       1,
						Timestamp: time.Date(1970, time.Month(1), 1, 0, 0, 0, 0, time.UTC),
					},
				}},
			&parse.ReplayEvents{
				Events: []*parse.ReplayEvent{
					{
						SID:       2,
						Timestamp: time.Date(1970, time.Month(1), 1, 1, 0, 0, 0, time.UTC),
					},
				},
			},
			time.Duration(1 * time.Hour),
		},
		"one last event, no duration": {
			&parse.ReplayEvents{
				Events: []*parse.ReplayEvent{},
			},
			&parse.ReplayEvents{
				Events: []*parse.ReplayEvent{
					{
						SID:       1,
						Timestamp: time.Date(1970, time.Month(1), 1, 1, 0, 0, 0, time.UTC),
					},
				}},
			time.Duration(0 * time.Hour),
		},
		"three events, active duration": {
			&parse.ReplayEvents{
				Events: []*parse.ReplayEvent{
					{
						SID:       1,
						Timestamp: time.Date(1970, time.Month(1), 1, 0, 0, 0, 0, time.UTC),
					},
					{
						SID:       2,
						Timestamp: time.Date(1970, time.Month(1), 1, 1, 0, 0, 0, time.UTC),
					},
				}},
			&parse.ReplayEvents{
				Events: []*parse.ReplayEvent{
					{
						SID:       1,
						Timestamp: time.Date(1970, time.Month(1), 1, 3, 0, 0, 0, time.UTC),
					},
					{
						SID:       2,
						Timestamp: time.Date(1970, time.Month(1), 1, 4, 0, 0, 0, time.UTC),
					},
				}},
			time.Duration(4 * time.Hour),
		},
	}
	for name, tt := range tables {
		t.Run(name, func(t *testing.T) {
			var firstTimestamp time.Time
			var lastTimestamp time.Time
			for _, event := range tt.firstEvents.Events {
				if event != nil {
					if firstTimestamp.IsZero() {
						firstTimestamp = event.Timestamp
					}
					lastTimestamp = event.Timestamp
				}
			}
			for _, event := range tt.lastEvents.Events {
				if event != nil {
					if firstTimestamp.IsZero() {
						firstTimestamp = event.Timestamp
					}
					lastTimestamp = event.Timestamp
				}
			}
			got := CalculateSessionLength(firstTimestamp, lastTimestamp)
			if diff := deep.Equal(tt.wantDifference, got); diff != nil {
				t.Errorf("[session length not equal to expected]: %v", diff)
			}
		})
	}
}

func TestGetActiveDuration(t *testing.T) {
	zeroTime := time.Time{}
	beginningOfTime := time.Unix(0, 1000000).UTC()
	tables := map[string]struct {
		events             []model.EventsObject
		wantActiveDuration time.Duration
		expectedFirstTS    time.Time
		expectedRageClicks []*model.RageClickEvent
	}{
		"one event": {
			[]model.EventsObject{{
				Events: `
				{
					"events": [{
						"_sid": 1,
						"data": {"test": 5},
						"timestamp": 1,
						"type": 4
					}]
				}
				`}},
			time.Duration(0 * time.Hour),
			zeroTime,
			nil,
		},
		"no events": {
			[]model.EventsObject{},
			time.Duration(0 * time.Hour),
			zeroTime,
			nil,
		},
		"two events, active duration": {
			[]model.EventsObject{
				{
					Events: `
				{
					"events": [{
						"_sid": 1,
						"data": {"source": 5},
						"timestamp": 1,
						"type": 2
					}]
				}
				`},
				{
					Events: `
				{
					"events": [{
						"_sid": 2,
						"data": {"source": 5},
						"timestamp": 1,
						"type": 3
					}]
				}
				`},
				{
					Events: `
					{
						"events": [{
							"_sid": 3,
							"data": {"source": 5},
							"timestamp": 5001,
							"type": 3
						}]
					}
					`}},
			time.Duration(5 * time.Second),
			beginningOfTime,
			nil,
		},
		"two events, no duration": {
			[]model.EventsObject{
				{
					Events: `
				{
					"events": [{
						"_sid": 1,
						"data": {"source": 5},
						"timestamp": 1,
						"type": 2
					}]
				}
				`},
				{
					Events: `
				{
					"events": [{
						"_sid": 2,
						"data": {"source": 5},
						"timestamp": 1,
						"type": 3
					}]
				}`},
				{
					Events: `
					{
						"events": [{
							"_sid": 3,
							"data": {"source": 5},
							"timestamp": 20000,
							"type": 3
						}]
					}
					`}},
			time.Duration(0 * time.Second),
			beginningOfTime,
			nil,
		},
		"multiple events, active duration": {
			[]model.EventsObject{
				{
					Events: `
				{
					"events": [{
						"_sid": 1,
						"data": {"source": 5},
						"timestamp": 1,
						"type": 2
					}]
				}
				`},
				{
					Events: `
				{
					"events": [{
						"_sid": 2,
						"data": {"source": 5},
						"timestamp": 1,
						"type": 3
					}]
				}`},
				{
					Events: `
					{
						"events": [{
							"_sid": 3,
							"data": {"test": 5},
							"timestamp": 500,
							"type": 4
						}]
					}`},
				{
					Events: `
					{
						"events": [{
							"_sid": 4,
							"data": {"source": 5},
							"timestamp": 1000,
							"type": 3
						}]
					}`},
				{
					Events: `
						{
							"events": [{
							"_sid": 5,
								"data": {"source": 5},
								"timestamp": 2001,
								"type": 3
							}]
						}`},
				{
					Events: `
					{
						"events": [{
							"_sid": 6,
							"data": {"source": 5},
							"timestamp": 20000,
							"type": 3
						}]
					}
					`}},
			time.Duration(2 * time.Second),
			beginningOfTime,
			nil,
		},
		"multiple events, rage click": {
			[]model.EventsObject{
				{
					Events: `
				{
					"events": [{
						"_sid": 1,
						"data": {"source": 5},
						"timestamp": 1,
						"type": 2
					}]
				}
				`},
				{
					Events: `
					{
						"events": [{
							"_sid": 2,
							"data": {"source": 2, "x": 1, "y": 1, "type": 2},
							"timestamp": 1,
							"type": 3
						}]
					}`,
				},
				{
					Events: `
					{
						"events": [{
							"_sid": 3,
							"data": {"source": 2, "x": 1, "y": 1, "type": 2},
							"timestamp": 100,
							"type": 3
						}]
					}`,
				},
				{
					Events: `
					{
						"events": [{
							"_sid": 4,
							"data": {"source": 2, "x": 1, "y": 1, "type": 2},
							"timestamp": 200,
							"type": 3
						}]
					}`,
				},
				{
					Events: `
					{
						"events": [{
							"_sid": 5,
							"data": {"source": 2, "x": 1, "y": 1, "type": 2},
							"timestamp": 300,
							"type": 3
						}]
					}`,
				},
				{
					Events: `
					{
						"events": [{
							"_sid": 6,
							"data": {"source": 2, "x": 1, "y": 1, "type": 2},
							"timestamp": 400,
							"type": 3
						}]
					}`,
				},
				{
					Events: `
					{
						"events": [{
							"_sid": 7,
							"data": {"source": 2, "x": 1, "y": 1, "type": 2},
							"timestamp": 450,
							"type": 3
						}]
					}`,
				},
				{
					Events: `
					{
						"events": [{
							"_sid": 8,
							"data": {"source": 2, "x": 1, "y": 1, "type": 2},
							"timestamp": 993,
							"type": 3
						}]
					}`,
				},
				{
					Events: `
					{
						"events": [{
							"_sid": 9,
							"data": {"source": 2, "x": 1, "y": 1, "type": 2},
							"timestamp": 994,
							"type": 3
						}]
					}`,
				},
				{
					Events: `
					{
						"events": [{
							"_sid": 10,
							"data": {"source": 2, "x": 1, "y": 1, "type": 2},
							"timestamp": 995,
							"type": 3
						}]
					}`,
				},
				{
					Events: `
					{
						"events": [{
							"_sid": 11,
							"data": {"source": 2, "x": 1, "y": 1, "type": 2},
							"timestamp": 996,
							"type": 3
						}]
					}`,
				},
				{
					Events: `
					{
						"events": [{
							"_sid": 12,
							"data": {"source": 2, "x": 1, "y": 1, "type": 2},
							"timestamp": 997,
							"type": 3
						}]
					}`,
				},
				{
					Events: `
					{
						"events": [{
							"_sid": 13,
							"data": {"source": 2, "x": 1, "y": 1, "type": 2},
							"timestamp": 1999,
							"type": 3
						}]
					}`,
				},
				{
					Events: `
					{
						"events": [{
							"_sid": 14,
							"data": {"source": 5},
							"timestamp": 2001,
							"type": 3
						}]
					}`,
				},
				{
					Events: `
					{
						"events": [{
							"_sid": 15,
							"data": {"source": 5},
							"timestamp": 20000,
							"type": 3
						}]
					}`,
				},
				{
					Events: `
					{
						"events": [{
							"_sid": 16,
							"data": {"source": 2, "x": 1, "y": 1, "type": 2},
							"timestamp": 200001,
							"type": 3
						}]
					}`,
				},
				{
					Events: `
					{
						"events": [{
							"_sid": 17,
							"data": {"source": 2, "x": 1, "y": 1, "type": 2},
							"timestamp": 200002,
							"type": 3
						}]
					}`,
				},
				{
					Events: `
					{
						"events": [{
							"_sid": 18,
							"data": {"source": 2, "x": 1, "y": 1, "type": 2},
							"timestamp": 200003,
							"type": 3
						}]
					}`,
				},
				{
					Events: `
					{
						"events": [{
							"_sid": 19,
							"data": {"source": 2, "x": 1, "y": 1, "type": 2},
							"timestamp": 200300,
							"type": 3
						}]
					}`,
				},
				{
					Events: `
					{
						"events": [{
							"_sid": 20,
							"data": {"source": 2, "x": 1, "y": 1, "type": 2},
							"timestamp": 200400,
							"type": 3
						}]
					}`,
				},
				{
					Events: `
					{
						"events": [
						{
							"_sid": 21,
							"data": {"source": 5},
							"timestamp": 200440,
							"type": 2
						},
						{
							"_sid": 22,
							"data": {"source": 5},
							"timestamp": 200441,
							"type": 2
						},
						{
							"_sid": 23,
							"data": {"source": 5},
							"timestamp": 200442,
							"type": 2
						},
						{
							"_sid": 24,
							"data": {"source": 5},
							"timestamp": 200443,
							"type": 2
						},
						{
							"_sid": 25,
							"data": {"source": 5},
							"timestamp": 200444,
							"type": 2
						},
						{
							"_sid": 26,
							"data": {"source": 5},
							"timestamp": 200445,
							"type": 2
						},
						{
							"_sid": 27,
							"data": {"source": 5},
							"timestamp": 200446,
							"type": 2
						},
						{
							"_sid": 28,
							"data": {"source": 5},
							"timestamp": 200447,
							"type": 2
						},
						{
							"_sid": 29,
							"data": {"source": 5},
							"timestamp": 200448,
							"type": 2
						},
						{
							"_sid": 30,
							"data": {"source": 5},
							"timestamp": 200449,
							"type": 2
						}]
					}`,
				},
				{
					Events: `
					{
						"events": [{
							"_sid": 31,
							"data": {"source": 2, "x": 1, "y": 1, "type": 2},
							"timestamp": 200450,
							"type": 3
						}]
					}`,
				},
				{
					Events: `
					{
						"events": [{
							"_sid": 32,
							"data": {"source": 2, "x": 1, "y": 1, "type": 2},
							"timestamp": 200993,
							"type": 3
						}]
					}`,
				},
				{
					Events: `
					{
						"events": [{
							"_sid": 33,
							"data": {"source": 2, "x": 1, "y": 1, "type": 2},
							"timestamp": 200994,
							"type": 3
						}]
					}`,
				},
				{
					Events: `
					{
						"events": [{
							"_sid": 34,
							"data": {"source": 2, "x": 1, "y": 1, "type": 2},
							"timestamp": 200995,
							"type": 3
						}]
					}`,
				},
				{
					Events: `
					{
						"events": [{
							"_sid": 35,
							"data": {"source": 2, "x": 1, "y": 1, "type": 2},
							"timestamp": 200996,
							"type": 3
						}]
					}`,
				},
				{
					Events: `
					{
						"events": [{
							"_sid": 36,
							"data": {"source": 2, "x": 1, "y": 1, "type": 2},
							"timestamp": 200997,
							"type": 3
						}]
					}`,
				},
				{
					Events: `
					{
						"events": [{
							"_sid": 37,
							"data": {"source": 2, "x": 1, "y": 1, "type": 2},
							"timestamp": 201999,
							"type": 3
						}]
					}`,
				},
				{
					Events: `
					{
						"events": [{
							"_sid": 38,
							"data": {"source": 2, "x": 1, "y": 1, "type": 2},
							"timestamp": 202001,
							"type": 3
						}]
					}`,
				},
			},
			time.Duration(4 * time.Second),
			beginningOfTime,
			[]*model.RageClickEvent{{TotalClicks: 11}, {TotalClicks: 12}},
		},
	}
	for name, tt := range tables {
		t.Run(name, func(t *testing.T) {
			log.SetOutput(io.Discard)
			a := MakeEventProcessingAccumulator("fakeSecureID", RageClickSettings{
				Window: 5 * time.Second,
				Radius: 8,
				Count:  5,
			})
			for _, event := range tt.events {
				a = processEventChunk(context.TODO(), a, event)
				if a.Error != nil {
					t.Logf("error: %v", a.Error)
				}
			}

			if tt.expectedRageClicks != nil {
				if diff := deep.Equal(tt.expectedRageClicks, a.RageClickSets); len(diff) > 0 {
					t.Errorf("expected rage clicks not equal to actual rage clicks (%+v)", diff)
				}
			}

			t.Logf("want: %v, actual: %v", tt.wantActiveDuration, a.ActiveDuration)
			if diff := deep.Equal(tt.wantActiveDuration, a.ActiveDuration); diff != nil {
				t.Errorf("[active duration not equal to expected]: %v", diff)
			}
			if diff := deep.Equal(tt.expectedFirstTS, a.FirstFullSnapshotTimestamp); diff != nil {
				t.Errorf("[expected first timestamp not equal to actual]: %v", diff)
			}
			for _, iii := range a.RageClickSets {
				t.Logf("rage click set: %+v", iii)
			}
		})
	}
}

func TestFullSnapshotProcessed(t *testing.T) {
	tables := map[string]struct {
		events []model.EventsObject
	}{
		"one meta event": {
			[]model.EventsObject{{
				Events: `
				{
					"events": [{
						"_sid": 1,
						"data": {"test": 5},
						"timestamp": 1,
						"type": 4
					}]
				}
				`}},
		},
		"no events": {
			[]model.EventsObject{},
		},
		"snapshot before incremental": {
			[]model.EventsObject{
				{
					Events: `
				{
					"events": [{
						"_sid": 1,
						"data": {"source": 5},
						"type": 2
					}]
				}
				`},
				{
					Events: `
				{
					"events": [{
						"_sid": 2,
						"data": {"source": 5},
						"timestamp": 1,
						"type": 3
					}]
				}
				`},
			},
		},
		"incremental before snapshot": {
			[]model.EventsObject{
				{
					Events: `
				{
					"events": [{
						"_sid": 1,
						"data": {"source": 5},
						"timestamp": 1,
						"type": 3
					}]
				}`},
				{
					Events: `
				{
					"events": [{
						"_sid": 2,
						"data": {"source": 5},
						"type": 2
					}]
				}
				`},
			},
		},
		"incremental alone": {
			[]model.EventsObject{
				{
					Events: `
				{
					"events": [{
						"_sid": 1,
						"data": {"source": 5},
						"timestamp": 1,
						"type": 3
					}]
				}`},
			},
		},
	}
	for name, tt := range tables {
		t.Run(name, func(t *testing.T) {
			log.SetOutput(io.Discard)
			a := MakeEventProcessingAccumulator("fakeSecureID", RageClickSettings{
				Window: 5 * time.Second,
				Radius: 8,
				Count:  5,
			})
			for _, event := range tt.events {
				a = processEventChunk(context.TODO(), a, event)
				if a.Error != nil {
					break
				}
			}
			if a.Error != nil {
				t.Errorf("expected success, actual error: %v", a.Error)
			}
		})
	}
}

func TestCalculateOverages(t *testing.T) {
	defer func(inclSessions, inclErrors, inclLogs, inclTraces int64) {
		pricing.ProductPrices[model2.PlanTypeGraduated][model.PricingProductTypeSessions] = pricing.ProductPricing{
			Included: inclSessions,
			Items:    pricing.ProductPrices[model2.PlanTypeGraduated][model.PricingProductTypeSessions].Items,
		}
		pricing.ProductPrices[model2.PlanTypeGraduated][model.PricingProductTypeErrors] = pricing.ProductPricing{
			Included: inclErrors,
			Items:    pricing.ProductPrices[model2.PlanTypeGraduated][model.PricingProductTypeErrors].Items,
		}
		pricing.ProductPrices[model2.PlanTypeGraduated][model.PricingProductTypeLogs] = pricing.ProductPricing{
			Included: inclLogs,
			Items:    pricing.ProductPrices[model2.PlanTypeGraduated][model.PricingProductTypeLogs].Items,
		}
		pricing.ProductPrices[model2.PlanTypeGraduated][model.PricingProductTypeTraces] = pricing.ProductPricing{
			Included: inclTraces,
			Items:    pricing.ProductPrices[model2.PlanTypeGraduated][model.PricingProductTypeTraces].Items,
		}
	}(
		pricing.ProductPrices[model2.PlanTypeGraduated][model.PricingProductTypeSessions].Included,
		pricing.ProductPrices[model2.PlanTypeGraduated][model.PricingProductTypeErrors].Included,
		pricing.ProductPrices[model2.PlanTypeGraduated][model.PricingProductTypeLogs].Included,
		pricing.ProductPrices[model2.PlanTypeGraduated][model.PricingProductTypeTraces].Included,
	)

	pricing.ProductPrices[model2.PlanTypeGraduated][model.PricingProductTypeSessions] = pricing.ProductPricing{
		Included: 2,
		Items:    pricing.ProductPrices[model2.PlanTypeGraduated][model.PricingProductTypeSessions].Items,
	}
	pricing.ProductPrices[model2.PlanTypeGraduated][model.PricingProductTypeErrors] = pricing.ProductPricing{
		Included: 3,
		Items:    pricing.ProductPrices[model2.PlanTypeGraduated][model.PricingProductTypeErrors].Items,
	}
	pricing.ProductPrices[model2.PlanTypeGraduated][model.PricingProductTypeLogs] = pricing.ProductPricing{
		Included: 4,
		Items:    pricing.ProductPrices[model2.PlanTypeGraduated][model.PricingProductTypeLogs].Items,
	}
	pricing.ProductPrices[model2.PlanTypeGraduated][model.PricingProductTypeTraces] = pricing.ProductPricing{
		Included: 5,
		Items:    pricing.ProductPrices[model2.PlanTypeGraduated][model.PricingProductTypeTraces].Items,
	}

	ctx := context.TODO()
	s := store.NewStore(DB, redisClient, nil, nil, nil, chClient)
	pWorker := pricing.NewWorker(DB, redisClient, s, chClient, nil, nil, sendgrid.NewSendClient(""))
	worker := Worker{
		Resolver: &graph.Resolver{
			DB:               DB,
			ClickhouseClient: chClient,
		},
	}

	now := time.Now().AddDate(0, 0, -14)
	end := now.AddDate(0, 1, 0)

	w := model.Workspace{
		BillingPeriodStart: &now,
		BillingPeriodEnd:   &end,
		PlanTier:           string(model2.PlanTypeGraduated),
	}
	if err := DB.Create(&w).Error; err != nil {
		t.Fatal(e.Wrap(err, "error inserting workspace"))
	}
	wMP := model.Workspace{
		BillingPeriodStart: &now,
		BillingPeriodEnd:   &end,
		PlanTier:           string(model2.PlanTypeGraduated),
		AWSMarketplaceCustomer: &model.AWSMarketplaceCustomer{
			CustomerIdentifier:   pointy.String("customer"),
			CustomerAWSAccountID: pointy.String("aws-account"),
			ProductCode:          pointy.String("product"),
		},
	}
	if err := DB.Create(&wMP).Error; err != nil {
		t.Fatal(e.Wrap(err, "error inserting workspace"))
	}

	for _, w := range []model.Workspace{w, wMP} {
		for i := 0; i < 5; i++ {
			p := model.Project{
				Name:        pointy.String("normal-workspace"),
				WorkspaceID: w.ID,
			}
			if err := DB.Create(&p).Error; err != nil {
				t.Fatal(e.Wrap(err, "error inserting project"))
			}
			a := model.Admin{
				Name:       pointy.String("bob-normal"),
				Workspaces: []model.Workspace{w},
			}
			if err := DB.Create(&a).Error; err != nil {
				t.Fatal(e.Wrap(err, "error inserting project"))
			}

			var sessions []*model.Session
			for idx := 0; idx < 10; idx++ {
				sessions = append(sessions, &model.Session{
					ProjectID:    p.ID,
					Excluded:     false,
					Processed:    pointy.Bool(true),
					ActiveLength: int64(1000 * idx),
				})
			}
			if err := DB.Model(&model.Session{}).CreateInBatches(&sessions, 1000).Error; err != nil {
				t.Fatal(e.Wrap(err, "error inserting sessions"))
			}

			var errors []*model.ErrorObject
			for idx := 0; idx < 11; idx++ {
				errors = append(errors, &model.ErrorObject{
					ProjectID: p.ID,
				})
			}
			if err := DB.Model(&model.ErrorObject{}).CreateInBatches(&errors, 1000).Error; err != nil {
				t.Fatal(e.Wrap(err, "error inserting errors"))
			}

			var logs []*clickhouse.LogRow
			for idx := 0; idx < 12; idx++ {
				logs = append(logs, clickhouse.NewLogRow(time.Now(), uint32(p.ID)))
			}
			if err := chClient.BatchWriteLogRows(ctx, logs); err != nil {
				t.Error(e.Wrap(err, "error inserting logs"))
				return
			}

			for idx := 0; idx < 13; idx++ {
				var traces []*clickhouse.ClickhouseTraceRow
				traces = append(traces, clickhouse.NewTraceRow(time.Now(), p.ID).AsClickhouseTraceRow())
				if err := chClient.BatchWriteTraceRows(ctx, traces); err != nil {
					t.Error(e.Wrap(err, "error inserting traces"))
					return
				}
			}
		}
	}

	worker.RefreshMaterializedViews(ctx)

	for _, w := range []*model.Workspace{&w, &wMP} {
		overages, err := pWorker.CalculateOverages(ctx, w.ID)
		assert.NoError(t, err)
		assert.Len(t, overages, 5)
		for product, overage := range overages {
			assert.Greaterf(t, overage, int64(1), "expected an overage for %d %s", w.ID, product)
		}
	}
}
