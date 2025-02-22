import {
	IconSolidLightningBolt,
	IconSolidLogs,
	IconSolidMetrics,
	IconSolidPlayCircle,
	IconSolidTraces,
} from '@highlight-run/ui/components'

import AngularIcon from '@/static/quickstart/angular.svg'
import ApolloIcon from '@/static/quickstart/apollo.svg'
import AWSLambdaIcon from '@/static/quickstart/aws-lambda.svg'
import AzureIcon from '@/static/quickstart/azure.svg'
import ChiIcon from '@/static/quickstart/chi.svg'
import CloudflareIcon from '@/static/quickstart/cloudflare.svg'
import DjangoIcon from '@/static/quickstart/django.svg'
import DotNetIcon from '@/static/quickstart/dotnet.svg'
import ElectronIcon from '@/static/quickstart/electron.svg'
import ElixirIcon from '@/static/quickstart/elixir.svg'
import ExpressIcon from '@/static/quickstart/express.svg'
import FastAPIIcon from '@/static/quickstart/fastapi.svg'
import FiberIcon from '@/static/quickstart/fiber.svg'
import FirebaseIcon from '@/static/quickstart/firebase.svg'
import FlaskIcon from '@/static/quickstart/flask.svg'
import FlyIOIcon from '@/static/quickstart/fly-io.svg'
import GatsbyIcon from '@/static/quickstart/gatsby.svg'
import GoIcon from '@/static/quickstart/go.svg'
import GoogleCloudIcon from '@/static/quickstart/google-cloud.svg'
import GQLGenIcon from '@/static/quickstart/gqlgen.svg'
import HerokuIcon from '@/static/integrations/heroku.svg'
import HonoIcon from '@/static/quickstart/hono.svg'
import JavaIcon from '@/static/quickstart/java.svg'
import JavascriptIcon from '@/static/quickstart/javascript.svg'
import MuxIcon from '@/static/quickstart/mux.png'
import NestJSIcon from '@/static/quickstart/nestjs.svg'
import NextJSIcon from '@/static/quickstart/nextjs.svg'
import NodeIcon from '@/static/quickstart/node.svg'
import PHPIcon from '@/static/quickstart/php.svg'
import PythonIcon from '@/static/quickstart/python.svg'
import PythonLoguruIcon from '@/static/quickstart/python-loguru.png'
import RailsIcon from '@/static/quickstart/rails.svg'
import ReactIcon from '@/static/quickstart/react.svg'
import RemixIcon from '@/static/quickstart/remix.png'
import RenderIcon from '@/static/quickstart/render.png'
import RubyIcon from '@/static/quickstart/ruby.svg'
import RustIcon from '@/static/quickstart/rust.svg'
import SvelteKitIcon from '@/static/quickstart/sveltekit.svg'
import VercelIcon from '@/static/quickstart/vercel.svg'
import VueIcon from '@/static/quickstart/vue.svg'
import {
	useClientIntegration,
	useLogsIntegration,
	useServerIntegration,
	useTracesIntegration,
	useMetricsIntegration,
} from '@/util/integrated'

export enum ProductArea {
	sessions = 'Sessions',
	errors = 'Errors',
	logs = 'Logs',
	traces = 'Traces',
	metrics = 'Metrics',
}

type ProductAreaInfo = {
	title: string
	link: string
	icon: React.ReactNode
	useIntegration: () => any
	hidden?: boolean
}

export const PRODUCT_AREAS: Record<ProductArea, ProductAreaInfo> = {
	[ProductArea.sessions]: {
		title: 'Sessions',
		link: '/sessions',
		icon: <IconSolidPlayCircle />,
		useIntegration: useClientIntegration,
	},
	[ProductArea.errors]: {
		title: 'Errors',
		link: '/errors',
		icon: <IconSolidLightningBolt />,
		useIntegration: useServerIntegration,
	},
	[ProductArea.logs]: {
		title: 'Logs',
		link: '/logs',
		icon: <IconSolidLogs />,
		useIntegration: useLogsIntegration,
	},
	[ProductArea.traces]: {
		title: 'Traces',
		link: '/traces',
		icon: <IconSolidTraces />,
		useIntegration: useTracesIntegration,
	},
	[ProductArea.metrics]: {
		title: 'Metrics',
		link: '/dashboards',
		icon: <IconSolidMetrics />,
		useIntegration: useMetricsIntegration,
	},
}

export const PRODUCT_AREA_KEYS = Object.values(ProductArea)

export const ICON_MAPPINGS = {
	angular: AngularIcon,
	apollo: ApolloIcon,
	awslambda: AWSLambdaIcon,
	azure: AzureIcon,
	chi: ChiIcon,
	cloudflare: CloudflareIcon,
	django: DjangoIcon,
	dotnet: DotNetIcon,
	electron: ElectronIcon,
	elixir: ElixirIcon,
	express: ExpressIcon,
	fastapi: FastAPIIcon,
	fiber: FiberIcon,
	firebase: FirebaseIcon,
	flask: FlaskIcon,
	flyio: FlyIOIcon,
	gatsby: GatsbyIcon,
	go: GoIcon,
	googlecloud: GoogleCloudIcon,
	gqlgen: GQLGenIcon,
	heroku: HerokuIcon,
	hono: HonoIcon,
	java: JavaIcon,
	javascript: JavascriptIcon,
	mux: MuxIcon,
	nestjs: NestJSIcon,
	nextjs: NextJSIcon,
	node: NodeIcon,
	php: PHPIcon,
	python: PythonIcon,
	pythonloguru: PythonLoguruIcon,
	rails: RailsIcon,
	react: ReactIcon,
	remix: RemixIcon,
	render: RenderIcon,
	ruby: RubyIcon,
	rust: RustIcon,
	sveltekit: SvelteKitIcon,
	vercel: VercelIcon,
	vue: VueIcon,
}
