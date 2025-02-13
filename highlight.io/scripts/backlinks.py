client_technologies = ['reactjs', 'nextjs', 'remix', 'vuejs', 'angular', 'gatsbyjs', 'sveltekit', 'electron', 'other', 'react-native']
replay_configuration = ['overview', 'canvas', 'console-messages', 'content-security-policy', 'identifying-sessions', 'iframes', 'monkey-patches', 'opentelemetry', 'persistent-assets', 'privacy', 'proxying-highlight', 'react-error-boundary', 'recording-network-requests-and-responses', 'recording-web-socket-events', 'salesforce-lwc', 'session-data-export', 'sourcemaps', 'tracking-events', 'troubleshooting', 'upgrading-highlight', 'versioning-sessions-and-errors']
server_techonologies = {
    'go': ['', 'overview', 'chi', 'echo', 'gin', 'mux', 'fiber', 'gorm', 'gqlgen', 'logrus', 'manual'],
    'js': ['', 'overview', 'apollo', 'aws-lambda', 'cloudflare', 'express', 'firebase', 'hono', 'nestjs', 'nextjs', 'nodejs', 'pino', 'trpc', 'winston'],
    'python': ['', 'overview', 'aws-lambda', 'azure-functions', 'django', 'fastapi', 'flask', 'google-cloud-functions', 'loguru', 'other', 'python-ai', 'python-libraries'],
    'ruby': ['', 'overview', 'other', 'rails'],
    'rust': ['', 'overview', 'actix', 'other'],
    'hosting': ['', 'overview', 'aws-metrics', 'aws', 'azure', 'fly-io', 'gcp', 'heroku', 'render', 'trigger', 'vercel'],
    'elixir': ['', 'overview', 'other'],
    'serverless': ['', 'overview', 'aws-lambda'],
    'java-other': [],
    'php-other': [],
    'dotnet': [],
    'dotnet-4': [],
    'docker': [],
    'file': [],
    'fluent-forward': [],
    'http': [],
    'otlp': [],
    'syslog': [],
    'systemd': [],
}
server_technologies_logging = {
    'backend-sdk': ['go', 'go/overview', 'go/chi', 'go/echo', 'go/fiber', 'go/gin', 'go/gqlgen', 'go/mux', 'js', 'js/overview', 'js/apollo', 'js/aws-lambda', 'js/cloudflare', 'js/express', 'js/firebase', 'js/hono', 'js/nestjs', 'js/nextjs', 'js/nodejs', 'js/trpc', 'python', 'python/overview', 'python/aws-lambda', 'python/azure-functions', 'python/django', 'python/fastapi', 'python/flask', 'python/google-cloud-functions', 'python/other', 'ruby', 'ruby/overview', 'ruby/other', 'ruby/rails', 'rust', 'rust/overview', 'rust/actix', 'rust/other', 'elixir', 'elixir/overview', 'elixir/other', 'dotnet', 'dotnet-4'],
    'backend-logging': ['go', 'go/overview', 'go/fiber', 'go/logrus', 'go/other', 'js', 'js/overview', 'js/cloudflare', 'js/nestjs', 'js/nodejs', 'js/pino', 'js/winston', 'python', 'python/overview', 'python/loguru', 'python/otel', 'python/other', 'ruby', 'ruby/overview', 'ruby/other', 'ruby/rails', 'rust', 'rust/overview', 'rust/actix', 'rust/other', 'hosting', 'hosting/overview', 'hosting/aws-metrics', 'hosting/aws', 'hosting/azure', 'hosting/fly-io', 'hosting/gcp', 'hosting/heroku', 'hosting/render', 'hosting/trigger', 'hosting/vercel', 'elixir', 'elixir/overview', 'elixir/other', 'dotnet', 'dotnet-4', 'docker', 'file', 'fluent-forward', 'http', 'otlp', 'syslog', 'systemd'],
    'backend-tracing': ['go', 'go/overview', 'go/manual', 'go/gorm', 'node-js/manual', 'node-js/nextjs', 'python', 'python/overview', 'python/manual', 'python/aws-lambda', 'python/azure-functions', 'python/django', 'python/fastapi', 'python/flask', 'python/google-cloud-functions', 'python/python-libraries', 'python/python-ai', 'ruby', 'ruby/overview', 'ruby/other', 'ruby/rails', 'rust', 'rust/overview', 'rust/actix', 'rust/other', 'serverless/aws-lambda', 'dotnet', 'dotnet-4'],
}

# edge cases
# java other, php other
# backend-tracing:
#   node-js/manual -> js/nodejs
#   node-js/nextjs -> js/nextjs

backlinks = {}

def get_client_backlinks():
    for tech in client_technologies:
        backlinks[f'getting-started/client-sdk/{tech}'] = f'/docs/getting-started/browser/{tech}'
    for config in replay_configuration:
        backlinks[f'getting-started/client-sdk/replay-configuration/{config}'] = f'/docs/getting-started/client-sdk/replay-configuration/{config}'

def get_server_backlinks():
    for lang in server_techonologies:
        if len(server_techonologies[lang]) == 0:
            if lang in server_technologies_logging['backend-sdk']:
                backlinks[f'getting-started/backend-sdk/{lang}'] = f'/docs/getting-started/server/{lang}'
            if lang in server_technologies_logging['backend-logging']:
                backlinks[f'getting-started/backend-logging/{lang}'] = f'/docs/getting-started/server/{lang}'
            if lang in server_technologies_logging['backend-tracing']:
                backlinks[f'getting-started/backend-tracing/{lang}'] = f'/docs/getting-started/server/{lang}'

        for tech in server_techonologies[lang]:
            final_route = f'{lang}/{tech}'

            if final_route.endswith('/'):
                final_route = final_route[:-1]

            if final_route in server_technologies_logging['backend-sdk']:
                backlinks[f'getting-started/backend-sdk/{final_route}'] = f'/docs/getting-started/server/{final_route}'
            if final_route in server_technologies_logging['backend-logging']:
                backlinks[f'getting-started/backend-logging/{final_route}'] = f'/docs/getting-started/server/{final_route}'

            if final_route in server_technologies_logging['backend-tracing']:
                backlinks[f'getting-started/backend-tracing/{final_route}'] = f'/docs/getting-started/server/{final_route}'

backlinks['getting-started/backend-sdk/java/overview'] = '/docs/getting-started/server/java-other'
backlinks['getting-started/backend-sdk/java/other'] = '/docs/getting-started/server/java-other'
backlinks['getting-started/backend-sdk/php/overview'] = '/docs/getting-started/server/php-other'
backlinks['getting-started/backend-sdk/php/other'] = '/docs/getting-started/server/php-other'

backlinks['getting-started/backend-logging/java/overview'] = '/docs/getting-started/server/java-other'
backlinks['getting-started/backend-logging/java/other'] = '/docs/getting-started/server/java-other'
backlinks['getting-started/backend-logging/php'] = '/docs/getting-started/server/php-other'

backlinks['getting-started/backend-tracing/php'] = '/docs/getting-started/server/php-other'

backlinks['getting-started/backend-tracing/node-js/manual'] = '/docs/getting-started/server/js/nodejs'
backlinks['getting-started/backend-tracing/node-js/nextjs'] = '/docs/getting-started/server/js/nextjs'

get_client_backlinks()
get_server_backlinks()

for bl in backlinks:
    print(f'"{bl}": "{backlinks[bl]}",')
