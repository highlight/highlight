import { siteUrl } from '../../utils/urls'
import { GoChiContent } from './backend/go/chi'
import { GoEchoContent } from './backend/go/echo'
import { GoFiberContent } from './backend/go/fiber'
import { GoGinContent } from './backend/go/gin'
import { GoGqlgenContent } from './backend/go/go-gqlgen'
import { GoMuxContent } from './backend/go/mux'
import { JavaOtherContent } from './backend/java/other'
import { JSApolloContent } from './backend/js/apollo'
import { JSAWSLambdaContent } from './backend/js/aws-lambda'
import { JSCloudflareContent } from './backend/js/cloudflare'
import { JSExpressContent } from './backend/js/express'
import { JSFirebaseContent } from './backend/js/firebase'
import { JSNestContent } from './backend/js/nestjs'
import { JSNodeContent } from './backend/js/nodejs'
import { JStRPCContent } from './backend/js/trpc'
import { OTLPErrorMonitoringContent } from './backend/otlp'
import { PHPOtherContent } from './backend/php/other'
import { PythonAWSContext } from './backend/python/aws'
import { PythonAzureContext } from './backend/python/azure'
import { PythonDjangoContext } from './backend/python/django'
import { PythonFastAPIContext } from './backend/python/fastapi'
import { PythonFlaskContext } from './backend/python/flask'
import { PythonGCPContext } from './backend/python/gcp'
import { PythonOtherContext } from './backend/python/other'
import { RubyOtherContent } from './backend/ruby/other'
import { RubyRailsContent } from './backend/ruby/rails'
import { RustActixContent } from './backend/rust/actix'
import { RustOtherContent } from './backend/rust/other'
import { ElixirOtherContent } from './backend/elixir/other'
import { AngularContent } from './frontend/angular'
import { ElectronContext } from './frontend/electron'
import { GatsbyContent } from './frontend/gatsby'
import { NextContent } from './frontend/next'
import { OtherContext } from './frontend/other'
import { ReactContent } from './frontend/react'
import { RemixContent } from './frontend/remix'
import { SvelteKitContent } from './frontend/sveltekit'
import { VueContent } from './frontend/vue'
import { DockerContent } from './logging/docker'
import { FileContent } from './logging/file'
import { FluentForwardContent } from './logging/fluentd'
import { GoFiberLogContent } from './logging/go/fiber'
import { GoOtherLogContent } from './logging/go/other'
import { HostingFlyIOLogContent } from './logging/hosting/fly-io'
import { HostingHerokuLogContent } from './logging/hosting/heroku'
import { HostingRenderLogContent } from './logging/hosting/render'
import { HostingVercelLogContent } from './logging/hosting/vercel'
import { HTTPContent } from './logging/http'
import { JavaOtherLogContent } from './logging/java/other'
import { JSCloudflareLoggingContent } from './logging/js/cloudflare'
import { JSNestLogContent } from './logging/js/nestjs'
import { JSOtherLogContent } from './logging/js/other'
import { JSPinoHTTPJSONLogContent } from './logging/js/pino'
import { JSWinstonHTTPJSONLogContent } from './logging/js/winston'
import { OTLPLoggingContent } from './logging/otlp'
import { PHPOtherLogContent } from './logging/php/other'
import { PythonLoguruLogContent } from './logging/python/loguru'
import { PythonOtelLogContent } from './logging/python/otel'
import { PythonOtherLogContent } from './logging/python/other'
import { RubyOtherLogContent } from './logging/ruby/other'
import { RubyRailsLogContent } from './logging/ruby/rails'
import { RustActixLogContent } from './logging/rust/actix'
import { RustOtherLogContent } from './logging/rust/other'
import { ElixirOtherLogContent } from './logging/elixir/other'
import { SyslogContent } from './logging/syslog'
import { SystemdContent } from './logging/systemd'
import { DevDeploymentContent } from './self-host/dev-deploy'
import { SelfHostContent } from './self-host/self-host'
import { DotNetOTLPTracingContent } from './traces/dotnet/dot-net'
import { DotNet4OTLPTracingContent } from './traces/dotnet/dot-net-4'
import { GoTracesContent } from './traces/go/go'
import { GormTracesContent } from './traces/go/gorm'
import { JSManualTracesContent } from './traces/node-js/manual'
import { NextJsTracesContent } from './traces/node-js/nextjs'
import { OTLPTracesContent } from './traces/otlp'
import { PHPTracesContent } from './traces/php'
import { PythonAWSTracesContent } from './traces/python/aws'
import { PythonAzureTracesContent } from './traces/python/azure'
import { PythonDjangoTracesContent } from './traces/python/django'
import { PythonFastAPITracesContent } from './traces/python/fastapi'
import { PythonFlaskTracesContent } from './traces/python/flask'
import { PythonGCPTracesContent } from './traces/python/gcp'
import { PythonManualTracesContent } from './traces/python/manual'
import { PythonAITracesContent } from './traces/python/python-ai'
import { PythonLibrariesTracesContent } from './traces/python/python-libraries'
import { RubyRailsTracesContent } from './traces/ruby/rails'
import { RubyOtherTracesContent } from './traces/ruby/other'
import { RustTracesContent } from './traces/rust'
import { AWSLambdaContent } from './traces/serverless/lambda'
import { JSHonoContent } from './backend/js/hono'
import { GoFiberReorganizedContent } from './server/go/fiber'
import { GoChiReorganizedContent } from './server/go/chi'
import { GoEchoReorganizedContent } from './server/go/echo'
import { GoGinReorganizedContent } from './server/go/gin'
import { GoGqlgenReorganizedContent } from './server/go/go-gqlgen'
import { GoMuxReorganizedContent } from './server/go/mux'
import { GoOtherLogReorganizedContent } from './server/go/logrus'
import { GormTracesReorganizedContent } from './server/go/gorm'
import { GoTracesReorganizedContent } from './server/go/go'
import { JavaOtherReorganizedContent } from './server/java/other'
import { JSAWSLambdaReorganizedContent } from './server/js/aws-lambda'
import { JSApolloReorganizedContent } from './server/js/apollo'
import { JSCloudflareReorganizedContent } from './server/js/cloudflare'
import { JSExpressReorganizedContent } from './server/js/express'
import { JSFirebaseReorganizedContent } from './server/js/firebase'
import { JSHonoReorganizedContent } from './server/js/hono'
import { JSNodeReorganizedContent } from './server/js/nodejs'
import { JSNestReorganizedContent } from './server/js/nestjs'
import { JStRPCReorganizedContent } from './server/js/trpc'
import { JSPinoHTTPJSONLogReorganizedContent } from './server/js/pino'
import { JSWinstonHTTPJSONLogReorganizedContent } from './server/js/winston'
import { JSManualTracesReorganizedContent } from './server/js/manual'
import { NextJsTracesReorganizedContent } from './server/js/nextjs'
import { PHPOtherReorganizedContent } from './server/php/other'
import { PythonAWSReorganizedContext } from './server/python/aws'
import { PythonAzureReorganizedContext } from './server/python/azure'
import { PythonDjangoReorganizedContext } from './server/python/django'
import { PythonFastAPIReorganizedContext } from './server/python/fastapi'
import { PythonFlaskReorganizedContext } from './server/python/flask'
import { PythonGCPReorganizedContext } from './server/python/gcp'
import { PythonLoguruLogReorganizedContent } from './server/python/loguru'
import { PythonOtherReorganizedContext } from './server/python/other'
import { PythonLibrariesTracesReorganizedContent } from './server/python/python-libraries'
import { PythonAITracesReorganizedContent } from './server/python/python-ai'
import { RubyOtherReorganizedContent } from './server/ruby/other'
import { RubyRailsReorganizedContent } from './server/ruby/rails'
import { RustActixReorganizedContent } from './server/rust/actix'
import { RustOtherReorganizedContent } from './server/rust/other'
import { OTLPReorganizedContent } from './server/otlp'
import { DotNetOTLPReorganizedContent } from './server/dotnet/dot-net'
import { DotNet4OTLPReorganizedContent } from './server/dotnet/dot-net-4'
import { FluentForwardReorganizedContent } from './server/fluentd'
import { FileReorganizedContent } from './server/file'
import { DockerReorganizedContent } from './server/docker'
import { HTTPReorganizedContent } from './server/http'
import { SyslogReorganizedContent } from './server/syslog'
import { SystemdReorganizedContent } from './server/systemd'
import { AWSLambdaReorganizedContent } from './server/serverless/lambda'
import { ElixirOtherReorganizedContent } from './server/elixir/other'
import { ReactNativeContent } from './mobile/react-native'

export type QuickStartOptions = {
	title: string
	metaTitle?: string
	subtitle: string
	logoUrl: string
} & {
	[key: string]: QuickStartContent
}

export type QuickStartContent = {
	title: string
	metaTitle?: string
	subtitle: string
	logoUrl?: string
	entries: Array<QuickStartStep>
	products?: ('Sessions' | 'Errors' | 'Traces' | 'Logs' | 'Metrics')[]
}

export type QuickStartCodeBlock = {
	key?: string
	text: string
	language: string
	copy?: string
}

export type QuickStartStep = {
	title: string
	content: string
	code?: QuickStartCodeBlock[]
	hidden?: true
}

export enum QuickStartType {
	Angular = 'angular',
	AWSLambda = 'aws-lambda',
	Electron = 'electron',
	React = 'react',
	Remix = 'remix',
	SvelteKit = 'svelte-kit',
	Next = 'next',
	Vue = 'vue',
	Gatsby = 'gatsby',
	SelfHost = 'self-host',
	DevDeploy = 'dev-deploy',
	Other = 'other',
	PythonFlask = 'flask',
	PythonDjango = 'django',
	PythonFastAPI = 'fastapi',
	PythonLoguru = 'loguru',
	PythonOtel = 'otel',
	PythonOther = 'other',
	PythonAWSFn = 'aws-lambda-python',
	PythonAzureFn = 'azure-functions',
	PythonGCPFn = 'google-cloud-functions',
	PythonLibraries = 'python-libraries',
	PythonAI = 'python-ai',
	GoGqlgen = 'gqlgen',
	GoFiber = 'fiber',
	GoChi = 'chi',
	GoEcho = 'echo',
	GoMux = 'mux',
	GoGin = 'gin',
	GoGorm = 'gorm',
	GoLogrus = 'logrus',
	GoOther = 'other',
	JSHono = 'hono',
	JSApollo = 'apollo',
	JSAWSFn = 'aws-lambda-node',
	JSCloudflare = 'cloudflare',
	JSExpress = 'express',
	JSFirebase = 'firebase',
	JSNodejs = 'nodejs',
	JSNextjs = 'nextjs',
	JSManual = 'manual',
	JSNestjs = 'nestjs',
	JSWinston = 'winston',
	JSPino = 'pino',
	JStRPC = 'trpc',
	HTTPOTLP = 'curl',
	Syslog = 'syslog',
	Systemd = 'systemd',
	FluentForward = 'fluent-forward',
	Docker = 'docker',
	File = 'file',
	RubyOther = 'other',
	RubyRails = 'rails',
	RustOther = 'other',
	RustActix = 'actix',
	ElixirOther = 'other',
	JavaOther = 'other',
	HostingVercel = 'vercel',
	HostingFlyIO = 'fly-io',
	HostingRender = 'render',
	HostingHeroku = 'heroku',
	ReactNative = 'react-native',
	OTLP = 'otlp',
	OTLPDotNet = 'dot-net',
	OTLPDotNet4 = 'dot-net-4',
}

export const quickStartContent = {
	client: {
		title: 'Client SDKs',
		subtitle: 'Select a client SDK to get started.',
		logoUrl: siteUrl('/images/quickstart/javascript.svg'),
		js: {
			title: 'Select your client framework',
			subtitle:
				'Select a client SDK to install session replay, error monitoring, and logging for your frontend application.',
			logoUrl: siteUrl('/images/quickstart/javascript.svg'),
			[QuickStartType.React]: ReactContent,
			[QuickStartType.Angular]: AngularContent,
			[QuickStartType.Next]: NextContent,
			[QuickStartType.Remix]: RemixContent,
			[QuickStartType.Vue]: VueContent,
			[QuickStartType.SvelteKit]: SvelteKitContent,
			[QuickStartType.Gatsby]: GatsbyContent,
			[QuickStartType.Electron]: ElectronContext,
			[QuickStartType.Other]: OtherContext,
		},
	},
	backend: {
		title: 'Select your backend language',
		subtitle:
			'Select a backend language to see the SDKs available for setting up error monitoring and logging for your application.',
		python: {
			title: 'Python',
			subtitle:
				'Select your Python framework to install error monitoring for your application.',
			logoUrl: siteUrl('/images/quickstart/python.svg'),
			[QuickStartType.PythonFlask]: PythonFlaskContext,
			[QuickStartType.PythonDjango]: PythonDjangoContext,
			[QuickStartType.PythonFastAPI]: PythonFastAPIContext,
			[QuickStartType.PythonOther]: PythonOtherContext,
			[QuickStartType.PythonAWSFn]: PythonAWSContext,
			[QuickStartType.PythonAzureFn]: PythonAzureContext,
			[QuickStartType.PythonGCPFn]: PythonGCPContext,
		},
		go: {
			title: 'Go',
			subtitle:
				'Select your Go framework to install error monitoring for your application.',
			logoUrl: siteUrl('/images/quickstart/go.svg'),
			[QuickStartType.GoGqlgen]: GoGqlgenContent,
			[QuickStartType.GoFiber]: GoFiberContent,
			[QuickStartType.GoEcho]: GoEchoContent,
			[QuickStartType.GoChi]: GoChiContent,
			[QuickStartType.GoMux]: GoMuxContent,
			[QuickStartType.GoGin]: GoGinContent,
		},
		js: {
			title: 'JavaScript',
			subtitle:
				'Select your JavaScript framework to install error monitoring for your application.',
			logoUrl: siteUrl('/images/quickstart/javascript.svg'),
			[QuickStartType.JSApollo]: JSApolloContent,
			[QuickStartType.JSAWSFn]: JSAWSLambdaContent,
			[QuickStartType.JSCloudflare]: JSCloudflareContent,
			[QuickStartType.JSExpress]: JSExpressContent,
			[QuickStartType.JSFirebase]: JSFirebaseContent,
			[QuickStartType.JSHono]: JSHonoContent,
			[QuickStartType.JSNodejs]: JSNodeContent,
			[QuickStartType.JSNestjs]: JSNestContent,
			[QuickStartType.JStRPC]: JStRPCContent,
		},
		ruby: {
			title: 'Ruby',
			subtitle:
				'Select your Ruby framework to install error monitoring for your application.',
			logoUrl: siteUrl('/images/quickstart/ruby.svg'),
			[QuickStartType.RubyRails]: RubyRailsContent,
			[QuickStartType.RubyOther]: RubyOtherContent,
		},
		rust: {
			title: 'Rust',
			subtitle:
				'Select your Rust framework to install error monitoring for your application.',
			logoUrl: siteUrl('/images/quickstart/rust.svg'),
			[QuickStartType.RustActix]: RustActixContent,
			[QuickStartType.RustOther]: RustOtherContent,
		},
		elixir: {
			title: 'Elixir',
			subtitle:
				'Select your Elixir framework to install error monitoring for your application.',
			logoUrl: siteUrl('/images/quickstart/elixir.svg'),
			[QuickStartType.ElixirOther]: ElixirOtherContent,
		},
		java: {
			title: 'Java',
			subtitle:
				'Select your Java framework to install error monitoring for your application.',
			logoUrl: siteUrl('/images/quickstart/java.svg'),
			[QuickStartType.JavaOther]: JavaOtherContent,
		},
		php: {
			title: 'PHP',
			subtitle:
				'Select your PHP framework to install error monitoring for your application.',
			logoUrl: siteUrl('/images/quickstart/php.svg'),
			[QuickStartType.Other]: PHPOtherContent,
		},
		dotnet: {
			title: 'C# .NET',
			subtitle: 'ASP C# .NET Applications',
			logoUrl: siteUrl('/images/quickstart/dotnet.svg'),
			[QuickStartType.OTLPDotNet]: DotNetOTLPTracingContent,
			[QuickStartType.OTLPDotNet4]: DotNet4OTLPTracingContent,
		},
		otlp: {
			title: 'OpenTelemetry',
			subtitle: 'OpenTelemetry Protocol (OTLP)',
			[QuickStartType.OTLP]: OTLPErrorMonitoringContent,
			[QuickStartType.OTLPDotNet]: DotNetOTLPTracingContent,
			[QuickStartType.OTLPDotNet4]: DotNet4OTLPTracingContent,
		},
	},
	'backend-logging': {
		title: 'Select your language',
		subtitle:
			'Select your backend language to install logging in your application.',
		python: {
			title: 'Python',
			subtitle:
				'Select your Python framework to install logging in your application.',
			logoUrl: siteUrl('/images/quickstart/python.svg'),
			[QuickStartType.PythonLoguru]: PythonLoguruLogContent,
			[QuickStartType.PythonOther]: PythonOtherLogContent,
			[QuickStartType.PythonOtel]: PythonOtelLogContent,
		},
		go: {
			title: 'Go',
			subtitle:
				'Select your Go framework to install logging in your application.',
			logoUrl: siteUrl('/images/quickstart/go.svg'),
			[QuickStartType.GoLogrus]: GoOtherLogContent,
			[QuickStartType.GoOther]: GoOtherLogContent,
			[QuickStartType.GoFiber]: GoFiberLogContent,
		},
		js: {
			title: 'JavaScript',
			subtitle:
				'Select your JavaScript framework to install logging in your application.',
			logoUrl: siteUrl('/images/quickstart/javascript.svg'),
			[QuickStartType.JSNodejs]: JSOtherLogContent,
			[QuickStartType.JSNestjs]: JSNestLogContent,
			[QuickStartType.JSWinston]: JSWinstonHTTPJSONLogContent,
			[QuickStartType.JSPino]: JSPinoHTTPJSONLogContent,
			[QuickStartType.JSCloudflare]: JSCloudflareLoggingContent,
		},
		other: {
			title: 'Infrastructure / Other',
			subtitle:
				'Get started with logging in your application via HTTP or OTLP.',
			[QuickStartType.FluentForward]: FluentForwardContent,
			[QuickStartType.File]: FileContent,
			[QuickStartType.Docker]: DockerContent,
			[QuickStartType.HTTPOTLP]: HTTPContent,
			[QuickStartType.Syslog]: SyslogContent,
			[QuickStartType.Systemd]: SystemdContent,
		},
		ruby: {
			title: 'Ruby',
			subtitle:
				'Select your Ruby framework to install logging in your application.',
			logoUrl: siteUrl('/images/quickstart/ruby.svg'),
			[QuickStartType.RubyRails]: RubyRailsLogContent,
			[QuickStartType.RubyOther]: RubyOtherLogContent,
		},
		rust: {
			title: 'Rust',
			subtitle:
				'Select your Rust framework to install logging in your application.',
			logoUrl: siteUrl('/images/quickstart/rust.svg'),
			[QuickStartType.RustActix]: RustActixLogContent,
			[QuickStartType.RustOther]: RustOtherLogContent,
		},
		elixir: {
			title: 'Elixir',
			subtitle:
				'Select your Elixir framework to install logging in your application.',
			logoUrl: siteUrl('/images/quickstart/elixir.svg'),
			[QuickStartType.ElixirOther]: ElixirOtherLogContent,
		},
		java: {
			title: 'Java',
			subtitle:
				'Select your Java framework to install logging in your application.',
			logoUrl: siteUrl('/images/quickstart/java.svg'),
			[QuickStartType.JavaOther]: JavaOtherLogContent,
		},
		php: {
			title: 'PHP',
			subtitle:
				'Select your PHP framework to install error monitoring for your application.',
			logoUrl: siteUrl('/images/quickstart/php.svg'),
			[QuickStartType.Other]: PHPOtherLogContent,
		},
		hosting: {
			title: 'Cloud Hosting Provider',
			subtitle:
				'Select your Hosting provider to setup the Highlight integration and stream logs.',
			[QuickStartType.HostingVercel]: HostingVercelLogContent,
			[QuickStartType.HostingFlyIO]: HostingFlyIOLogContent,
			[QuickStartType.HostingRender]: HostingRenderLogContent,
			[QuickStartType.HostingHeroku]: HostingHerokuLogContent,
		},
		dotnet: {
			title: 'C# .NET',
			subtitle: 'ASP C# .NET Applications',
			logoUrl: siteUrl('/images/quickstart/dotnet.svg'),
			[QuickStartType.OTLPDotNet]: DotNetOTLPTracingContent,
			[QuickStartType.OTLPDotNet4]: DotNet4OTLPTracingContent,
		},
		otlp: {
			title: 'OpenTelemetry',
			subtitle: 'OpenTelemetry Protocol (OTLP)',
			[QuickStartType.OTLP]: OTLPLoggingContent,
			[QuickStartType.OTLPDotNet]: DotNetOTLPTracingContent,
			[QuickStartType.OTLPDotNet4]: DotNet4OTLPTracingContent,
		},
	},
	traces: {
		title: 'Select your language',
		subtitle:
			'Tracing is supported with the Highlight SDKs or via the OpenTelemetry protocol (OTLP).',
		'node-js': {
			title: 'Node.js',
			subtitle: 'Manually trace your Node.js application.',
			logoUrl: siteUrl('/images/quickstart/javascript.svg'),
			[QuickStartType.JSManual]: JSManualTracesContent,
		},
		'next-js': {
			title: 'Next.js',
			subtitle: 'Trace your Next.js application.',
			logoUrl: siteUrl('/images/quickstart/nextjs.svg'),
			[QuickStartType.JSNextjs]: NextJsTracesContent,
		},
		go: {
			title: 'Go',
			subtitle: 'Install tracing in your Go application.',
			logoUrl: siteUrl('/images/quickstart/go.svg'),
			[QuickStartType.GoOther]: GoTracesContent,
			[QuickStartType.GoGorm]: GormTracesContent,
		},
		python: {
			title: 'Python',
			subtitle: 'Install tracing in your Python application.',
			logoUrl: siteUrl('/images/quickstart/python.svg'),
			[QuickStartType.PythonOther]: PythonManualTracesContent,
			[QuickStartType.PythonAWSFn]: PythonAWSTracesContent,
			[QuickStartType.PythonAzureFn]: PythonAzureTracesContent,
			[QuickStartType.PythonDjango]: PythonDjangoTracesContent,
			[QuickStartType.PythonFastAPI]: PythonFastAPITracesContent,
			[QuickStartType.PythonFlask]: PythonFlaskTracesContent,
			[QuickStartType.PythonGCPFn]: PythonGCPTracesContent,
			[QuickStartType.PythonLibraries]: PythonLibrariesTracesContent,
			[QuickStartType.PythonAI]: PythonAITracesContent,
		},
		php: {
			title: 'PHP',
			subtitle: 'Install tracing in your PHP application.',
			logoUrl: siteUrl('/images/quickstart/php.svg'),
			[QuickStartType.Other]: PHPTracesContent,
		},
		dotnet: {
			title: 'C# .NET',
			subtitle: 'ASP C# .NET Applications',
			logoUrl: siteUrl('/images/quickstart/dotnet.svg'),
			[QuickStartType.OTLPDotNet]: DotNetOTLPTracingContent,
			[QuickStartType.OTLPDotNet4]: DotNet4OTLPTracingContent,
		},
		otlp: {
			title: 'OpenTelemetry',
			subtitle: 'OpenTelemetry Protocol (OTLP)',
			[QuickStartType.OTLP]: OTLPTracesContent,
			[QuickStartType.OTLPDotNet]: DotNetOTLPTracingContent,
			[QuickStartType.OTLPDotNet4]: DotNet4OTLPTracingContent,
		},
		rust: {
			title: 'Rust',
			subtitle:
				'Select your Rust framework to install logging in your application.',
			logoUrl: siteUrl('/images/quickstart/rust.svg'),
			[QuickStartType.RustOther]: RustTracesContent,
			[QuickStartType.RustActix]: RustTracesContent,
		},
		serverless: {
			title: 'Serverless',
			subtitle: 'Install tracing in your Serverless application.',
			logoUrl: siteUrl('/images/quickstart/serverless.svg'),
			[QuickStartType.AWSLambda]: AWSLambdaContent,
		},
		ruby: {
			title: 'Ruby',
			subtitle: 'Install tracing in your Ruby application.',
			logoUrl: siteUrl('/images/quickstart/ruby.svg'),
			[QuickStartType.RubyRails]: RubyRailsTracesContent,
			[QuickStartType.RubyOther]: RubyOtherTracesContent,
		},
	},
	metrics: {
		title: 'Select your language',
		subtitle:
			'Metrics are supported with the Highlight SDKs or via the OpenTelemetry protocol (OTLP).',
		dotnet: {
			title: 'C# .NET',
			subtitle: 'ASP C# .NET Applications',
			logoUrl: siteUrl('/images/quickstart/dotnet.svg'),
			[QuickStartType.OTLPDotNet]: DotNetOTLPTracingContent,
			[QuickStartType.OTLPDotNet4]: DotNet4OTLPTracingContent,
		},
		otlp: {
			title: 'OpenTelemetry',
			subtitle: 'OpenTelemetry Protocol (OTLP)',
			[QuickStartType.OTLP]: OTLPTracesContent,
		},
	},
	mobile: {
		[QuickStartType.ReactNative]: ReactNativeContent,
	},
	other: {
		[QuickStartType.SelfHost]: SelfHostContent,
		[QuickStartType.DevDeploy]: DevDeploymentContent,
	},
} as const

export const quickStartContentReorganized = {
	client: {
		title: 'Client',
		sdks: {
			[QuickStartType.React]: ReactContent,
			[QuickStartType.Angular]: AngularContent,
			[QuickStartType.Next]: NextContent,
			[QuickStartType.Remix]: RemixContent,
			[QuickStartType.Vue]: VueContent,
			[QuickStartType.SvelteKit]: SvelteKitContent,
			[QuickStartType.Gatsby]: GatsbyContent,
			[QuickStartType.Electron]: ElectronContext,
			[QuickStartType.Other]: OtherContext,
		},
	},
	mobile: {
		title: 'Mobile',
		sdks: {
			[QuickStartType.ReactNative]: ReactNativeContent,
		},
	},
	dotnet: {
		title: '.NET',
		sdks: {
			[QuickStartType.OTLPDotNet]: DotNetOTLPReorganizedContent,
			[QuickStartType.OTLPDotNet4]: DotNet4OTLPReorganizedContent,
		},
	},
	elixir: {
		title: 'Elixir',
		sdks: {
			[QuickStartType.ElixirOther]: ElixirOtherReorganizedContent,
		},
	},
	go: {
		title: 'Golang',
		sdks: {
			[QuickStartType.GoChi]: GoChiReorganizedContent,
			[QuickStartType.GoEcho]: GoEchoReorganizedContent,
			[QuickStartType.GoFiber]: GoFiberReorganizedContent,
			[QuickStartType.GoGin]: GoGinReorganizedContent,
			[QuickStartType.GoGqlgen]: GoGqlgenReorganizedContent,
			[QuickStartType.GoMux]: GoMuxReorganizedContent,
			[QuickStartType.GoLogrus]: GoOtherLogReorganizedContent,
			[QuickStartType.GoGorm]: GormTracesReorganizedContent,
			[QuickStartType.GoOther]: GoTracesReorganizedContent,
		},
	},
	infra: {
		title: 'Infrastructure / Other',
		sdks: {
			[QuickStartType.FluentForward]: FluentForwardReorganizedContent,
			[QuickStartType.File]: FileReorganizedContent,
			[QuickStartType.Docker]: DockerReorganizedContent,
			[QuickStartType.HTTPOTLP]: HTTPReorganizedContent,
			[QuickStartType.Syslog]: SyslogReorganizedContent,
			[QuickStartType.Systemd]: SystemdReorganizedContent,
		},
	},
	java: {
		title: 'Java',
		sdks: {
			[QuickStartType.JavaOther]: JavaOtherReorganizedContent,
		},
	},
	js: {
		title: 'JavaScript',
		sdks: {
			[QuickStartType.JSApollo]: JSApolloReorganizedContent,
			[QuickStartType.JSAWSFn]: JSAWSLambdaReorganizedContent,
			[QuickStartType.JSCloudflare]: JSCloudflareReorganizedContent,
			[QuickStartType.JSExpress]: JSExpressReorganizedContent,
			[QuickStartType.JSFirebase]: JSFirebaseReorganizedContent,
			[QuickStartType.JSHono]: JSHonoReorganizedContent,
			[QuickStartType.JSNodejs]: JSNodeReorganizedContent,
			[QuickStartType.JSNestjs]: JSNestReorganizedContent,
			[QuickStartType.JStRPC]: JStRPCReorganizedContent,
			[QuickStartType.JSPino]: JSPinoHTTPJSONLogReorganizedContent,
			[QuickStartType.JSWinston]: JSWinstonHTTPJSONLogReorganizedContent,
			[QuickStartType.JSManual]: JSManualTracesReorganizedContent,
			[QuickStartType.JSNextjs]: NextJsTracesReorganizedContent,
		},
	},
	otlp: {
		title: 'OpenTelemetry',
		sdks: {
			[QuickStartType.OTLP]: OTLPReorganizedContent,
		},
	},
	php: {
		title: 'PHP',
		sdks: {
			[QuickStartType.Other]: PHPOtherReorganizedContent,
		},
	},
	python: {
		title: 'Python',
		sdks: {
			[QuickStartType.PythonAWSFn]: PythonAWSReorganizedContext,
			[QuickStartType.PythonAzureFn]: PythonAzureReorganizedContext,
			[QuickStartType.PythonDjango]: PythonDjangoReorganizedContext,
			[QuickStartType.PythonFastAPI]: PythonFastAPIReorganizedContext,
			[QuickStartType.PythonFlask]: PythonFlaskReorganizedContext,
			[QuickStartType.PythonGCPFn]: PythonGCPReorganizedContext,
			[QuickStartType.PythonLoguru]: PythonLoguruLogReorganizedContent,
			[QuickStartType.PythonOther]: PythonOtherReorganizedContext,
			[QuickStartType.PythonLibraries]:
				PythonLibrariesTracesReorganizedContent,
			[QuickStartType.PythonAI]: PythonAITracesReorganizedContent,
		},
	},
	ruby: {
		title: 'Ruby',
		sdks: {
			[QuickStartType.RubyOther]: RubyOtherReorganizedContent,
			[QuickStartType.RubyRails]: RubyRailsReorganizedContent,
		},
	},
	rust: {
		title: 'Rust',
		sdks: {
			[QuickStartType.RustActix]: RustActixReorganizedContent,
			[QuickStartType.RustOther]: RustOtherReorganizedContent,
		},
	},
	serverless: {
		title: 'Serverless',
		sdks: {
			[QuickStartType.AWSLambda]: AWSLambdaReorganizedContent,
		},
	},
}
