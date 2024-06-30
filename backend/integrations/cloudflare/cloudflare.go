package cloudflare

import (
	"context"
	"fmt"
	"github.com/cloudflare/cloudflare-go"
	log "github.com/sirupsen/logrus"
)

const ScriptName = "highlight-proxy"
const Script = `
async function handleRequest(request, ctx) {
  const url = new URL(request.url)
  const pathname = url.pathname
  const search = url.search
  const pathWithParams = pathname + search
  return forwardRequest(request, pathWithParams)
}

async function forwardRequest(request, pathWithSearch) {
  const originRequest = new Request(request)
  originRequest.headers.delete("cookie")
  return await fetch("https://pub.highlight.io", originRequest)
}

export default {
  async fetch(request, env, ctx) {
    return handleRequest(request, ctx);
  }
};
`

type Client struct {
	api                         *cloudflare.API
	accountID, zoneID, zoneName string
}

func (c *Client) CreateWorker(ctx context.Context, proxySubdomain string) (string, error) {
	r1, err := c.api.UploadWorker(ctx, cloudflare.AccountIdentifier(c.accountID), cloudflare.CreateWorkerParams{
		ScriptName: ScriptName,
		Script:     Script,
		Module:     true,
	})
	if err != nil {
		return "", err
	}
	log.WithField("response", r1).Info("UploadWorker")

	route := fmt.Sprintf("%s.%s", proxySubdomain, c.zoneName)
	r2, err := c.api.CreateWorkerRoute(ctx, cloudflare.ZoneIdentifier(c.zoneID), cloudflare.CreateWorkerRouteParams{
		Pattern: fmt.Sprintf("%s/*", route),
		Script:  ScriptName,
	})
	if err != nil {
		return "", err
	}
	log.WithField("response", r2).Info("CreateWorkerRoute")

	return route, nil
}

func New(ctx context.Context, apiToken string) (*Client, error) {
	// requires apiToken to have
	//account.workers_scripts.edit, zone.workers_routes.edit
	api, err := cloudflare.NewWithAPIToken(apiToken)
	if err != nil {
		log.WithContext(ctx).Error(err)
		return nil, err
	}

	accounts, r1, err := api.Accounts(ctx, cloudflare.AccountsListParams{})
	if err != nil {
		log.WithContext(ctx).Error(err)
		return nil, err
	}
	log.WithField("response", r1).Info("Accounts")

	zones, err := api.ListZones(ctx)
	if err != nil {
		log.WithContext(ctx).Error(err)
		return nil, err
	}
	log.WithField("response", zones).Info("ListZones")

	return &Client{
		api:       api,
		accountID: accounts[0].ID,
		zoneID:    zones[0].ID,
		zoneName:  zones[0].Name,
	}, nil
}
