import { QuickStartContent } from '../QuickstartContent'
import {
	clone,
	dashboard,
	dependencies,
	start,
	troubleshoot,
} from './shared-snippets'

export const SelfHostContent: QuickStartContent = {
	title: 'Self-hosted (Hobby) Deployment',
	subtitle:
		'Learn how to set up the self-hosted hobby deployment of highlight.io.',
	entries: [
		{
			title: 'Prerequisites',
			content:
				'Before we get started, you should have the latest version of [Docker](https://docs.docker.com/engine/install/) (19.03.0+) ' +
				'and [Git](https://git-scm.com/downloads) (2.13+) installed. ' +
				'For a local hobby deploy, we suggest [configuring docker](https://docs.docker.com/desktop/settings/mac/#resources) ' +
				'to use at least 12GB of memory, 4 CPUs, and 128 GB of disk space.',
			code: {
				language: 'bash',
				text: `$ docker --version
Docker version 20.10.23, build 7155243
$ docker compose version
Docker Compose version v2.15.1`,
			},
		},
		clone,
		{
			title: 'Start highlight.',
			content:
				'In the `highlight/docker` directory, run `./run-hobby.sh` to start the docker stack.',
			code: {
				text: `cd highlight/docker;
./run-hobby.sh;`,
				language: 'bash',
			},
		},
		dashboard,
		{
			title: 'Setup the snippet.',
			content:
				'In your frontend application, you should setup highlight.io as usual (see [our guides](https://highlight.io/docs/getting-started/overview#For-your-frontend)), with the exception of adding the `backendUrl` flag to your `init()` method. See the example in react to the right. ',
			code: {
				text: `import { H } from 'highlight.run';

H.init('<YOUR_PROJECT_ID>', {
    backendUrl: 'https://localhost:8082/public',
    ...
});`,
				language: 'javascript',
			},
		},
		troubleshoot,
	],
}
