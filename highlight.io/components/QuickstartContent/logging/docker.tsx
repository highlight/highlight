import { QuickStartContent } from '../QuickstartContent'
import { verifyLogs } from './shared-snippets'

export const DockerContent: QuickStartContent = {
	title: 'Logging in Docker or Docker Compose',
	subtitle: 'Ship docker logs to highlight using the fluentd log driver.',
	entries: [
		{
			title: 'Setup the fluentd log driver.',
			content:
				'Use the [Fluentd logging driver](https://docs.docker.com/config/containers/logging/fluentd/) to route logs to highlight.',
			code: [
				{
					text: `docker run --log-driver=fluentd --log-opt fluentd-address=otel.highlight.io:24224 --log-opt tag=highlight.project_id=<YOUR_PROJECT_ID> -t ubuntu echo "Testing a log message"`,
					language: 'bash',
				},
			],
		},
		{
			title: 'Setup the fluentd log driver in docker compose.',
			content:
				'Use the following syntax if you are using [docker compose](https://docs.docker.com/config/containers/logging/configure/).',
			code: [
				{
					text: `x-logging:
  &highlight-logging
    driver: fluentd
    options:
        fluentd-address: "tls://otel.highlight.io:24284"
        fluentd-async: "true"
        fluentd-sub-second-precision: "true"
        tag: "highlight.project_id=<YOUR_PROJECT_ID>"
services:
    example:
        logging: *highlight-logging
        image: ubuntu
        container_name: ubuntu
        command:
            - echo
            - "hello, highlight.io!"
`,
					language: 'yaml',
				},
			],
		},
		verifyLogs,
	],
}
