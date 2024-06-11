package cloudflare

import (
	"context"
	"github.com/cloudflare/cloudflare-go"
	log "github.com/sirupsen/logrus"
	"os"
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

var (
	ApiToken = os.Getenv("CLOUDFLARE_API_TOKEN")
)

type Client struct {
	api               *cloudflare.API
	accountID, zoneID string
}

func (c *Client) CreateWorker(ctx context.Context) {
	r1, err := c.api.UploadWorker(ctx, cloudflare.AccountIdentifier(c.accountID), cloudflare.CreateWorkerParams{
		ScriptName: ScriptName,
		Script:     Script,
		Module:     true,
	})
	if err != nil {
		log.Fatal(err)
	}
	log.WithField("response", r1).Info("UploadWorker")

	r2, err := c.api.CreateWorkerRoute(ctx, cloudflare.ZoneIdentifier(c.zoneID), cloudflare.CreateWorkerRouteParams{
		Pattern: "proxy.runhighlight.com/*",
		Script:  ScriptName,
	})
	if err != nil {
		log.Fatal(err)
	}
	log.WithField("response", r2).Info("CreateWorkerRoute")

}

func New() *Client {
	ctx := context.Background()

	// Construct a new API object a scoped API token
	api, err := cloudflare.NewWithAPIToken(ApiToken)
	if err != nil {
		log.Fatal(err)
	}

	accounts, r1, err := api.Accounts(ctx, cloudflare.AccountsListParams{})
	if err != nil {
		log.Fatal(err)
	}
	log.WithField("response", r1).Info("Accounts")

	zones, err := api.ListZones(ctx)
	if err != nil {
		log.Fatal(err)
	}
	log.WithField("response", zones).Info("ListZones")

	return &Client{
		api:       api,
		accountID: accounts[0].ID,
		zoneID:    zones[0].ID,
	}
}
