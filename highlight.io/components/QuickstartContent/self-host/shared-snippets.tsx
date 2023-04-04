import { siteUrl } from '../../../utils/urls'
import { QuickStartStep } from '../QuickstartContent'

export const dependencies: QuickStartStep = {
	title: 'Prerequisites',
	content:
		'Before we get started, you should have the latest version of [docker](https://docs.docker.com/engine/install/) (19.03.0+) and [git](https://git-scm.com/downloads) (2.13+) installed. For a local deploy, we suggest [configuring docker](https://docs.docker.com/desktop/settings/mac/#resources) to use at least 16GB of memory, 4 CPUs, and 50 GB of disk space. ' +
		'Ensure you have installed Golang 1.19 and Node.js 16.',
	code: {
		language: 'bash',
		text: `$ go version
go version go1.19.3 darwin/arm64
$ node --version
v16.15.0`,
	},
}
