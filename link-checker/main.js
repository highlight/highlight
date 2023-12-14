const { SiteChecker } = require("broken-link-checker");
const axios = require('axios');

const slackWebHookUrl = process.env.SLACK_WEBHOOK_URL;

const siteChecker = new SiteChecker(
    {
        excludeInternalLinks: false,
        excludeExternalLinks: false,
        filterLevel: 0,
        acceptedSchemes: ["http", "https"],
        excludedKeywords: ["linkedin", "twitter"],
        excludeLinksToSamePage: true
    },
    {
        "error": (error) => {
            console.log(error);
        },
        "link": (result) => {
            if(result.broken)
            {
                if(result.http.response && ![undefined, 401, 403, 308, 405].includes(result.http.response.statusCode))
                {
                    axios.post(slackWebHookUrl, {text: `${result.http.response.statusCode} => ${result.url.original}`});
                }
            }
        }
    }
);

siteChecker.enqueue("https://www.highlight.io/docs");
