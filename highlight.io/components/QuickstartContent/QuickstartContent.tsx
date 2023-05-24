import { siteUrl } from '../../utils/urls'
import { GoChiContent } from './backend/go/chi'
import { GoFiberContent } from './backend/go/fiber'
import { GoGinContent } from './backend/go/gin'
import { GoGqlgenContent } from './backend/go/go-gqlgen'
import { GoMuxContent } from './backend/go/mux'
import { JSApolloContent } from './backend/js/apollo'
import { JSCloudflareContent } from './backend/js/cloudflare'
import { JSExpressContent } from './backend/js/express'
import { JSFirebaseContent } from './backend/js/firebase'
import { JSNestContent } from './backend/js/nestjs'
import { JSNodeContent } from './backend/js/nodejs'
import { JStRPCContent } from './backend/js/trpc'
import { PythonAWSContext } from './backend/python/aws'
import { PythonAzureContext } from './backend/python/azure'
import { PythonDjangoContext } from './backend/python/django'
import { PythonFastAPIContext } from './backend/python/fastapi'
import { PythonFlaskContext } from './backend/python/flask'
import { PythonGCPContext } from './backend/python/gcp'
import { PythonOtherContext } from './backend/python/other'
import { RubyOtherContent } from './backend/ruby/other'
import { RubyRailsContent } from './backend/ruby/rails'
import { AngularContent } from './frontend/angular'
import { GatsbyContent } from './frontend/gatsby'
import { NextContent } from './frontend/next'
import { OtherContext } from './frontend/other'
import { ReactContent } from './frontend/react'
import { SvelteKitContent } from './frontend/sveltekit'
import { VueContent } from './frontend/vue'
import { GoFiberLogContent } from './logging/go/fiber'
import { GoOtherLogContent } from './logging/go/other'
import { HostingVercelLogContent } from './logging/hosting/vercel'
import { HTTPContent } from './logging/http'
import { JSNestLogContent } from './logging/js/nestjs'
import { JSOtherLogContent } from './logging/js/other'

import { JSWinstonHTTPJSONLogContent } from './logging/js/winston'
import { PythonOtherLogContent } from './logging/python/other'
import { RubyOtherLogContent } from './logging/ruby/other'
import { RubyRailsLogContent } from './logging/ruby/rails'
import { DevDeploymentContent } from './self-host/dev-deploy'
import { SelfHostContent } from './self-host/self-host'
import { JSCloudflareLoggingContent } from './logging/js/cloudflare'
import { FluentForwardContent } from './logging/fluentd'
import { FileContent } from './logging/file'

export type QuickStartOptions = {
	title: string
	subtitle: string
	logoUrl: string
} & {
	[key: string]: QuickStartContent
}

export type QuickStartContent = {
	title: string
	subtitle: string
	logoUrl?: string
	entries: Array<QuickStartStep>
}

export type QuickStartStep = {
	title: string
	content: string
	code?: {
		text: string
		language: string
	}
	hidden?: true
}

export enum QuickStartType {
	Angular = 'angular',
	React = 'react',
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
	PythonOther = 'other',
	PythonAWSFn = 'aws-lambda',
	PythonAzureFn = 'azure-functions',
	PythonGCPFn = 'google-cloud-functions',
	GoGqlgen = 'gqlgen',
	GoFiber = 'fiber',
	GoChi = 'chi',
	GoMux = 'mux',
	GoGin = 'gin',
	GoLogrus = 'logrus',
	GoOther = 'other',
	JSApollo = 'apollo',
	JSCloudflare = 'cloudflare',
	JSExpress = 'express',
	JSFirebase = 'firebase',
	JSNodejs = 'nodejs',
	JSNestjs = 'nestjs',
	JSWinston = 'winston',
	JStRPC = 'trpc',
	HTTPOTLP = 'curl',
	FluentForward = 'fluent-forward',
	File = 'file',
	RubyOther = 'other',
	RubyRails = 'rails',
	HostingVercel = 'vercel',
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
			[QuickStartType.Vue]: VueContent,
			[QuickStartType.SvelteKit]: SvelteKitContent,
			[QuickStartType.Gatsby]: GatsbyContent,
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
			[QuickStartType.JSCloudflare]: JSCloudflareContent,
			[QuickStartType.JSExpress]: JSExpressContent,
			[QuickStartType.JSFirebase]: JSFirebaseContent,
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
			[QuickStartType.PythonOther]: PythonOtherLogContent,
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
			[QuickStartType.JSCloudflare]: JSCloudflareLoggingContent,
		},
		http: {
			title: 'curl',
			subtitle:
				'Get started with logging in your application via HTTP or OTLP.',
			[QuickStartType.HTTPOTLP]: HTTPContent,
		},
		other: {
			title: 'Other',
			subtitle:
				'Get started with logging in your application via HTTP or OTLP.',
			[QuickStartType.FluentForward]: FluentForwardContent,
			[QuickStartType.File]: FileContent,
		},
		ruby: {
			title: 'Ruby',
			subtitle:
				'Select your Ruby framework to install logging in your application.',
			logoUrl: siteUrl('/images/quickstart/ruby.svg'),
			[QuickStartType.RubyRails]: RubyRailsLogContent,
			[QuickStartType.RubyOther]: RubyOtherLogContent,
		},
		hosting: {
			title: 'Hosting Provider',
			subtitle:
				'Select your Hosting provider to setup the Highlight integration and stream logs.',
			[QuickStartType.HostingVercel]: HostingVercelLogContent,
		},
	},
	other: {
		[QuickStartType.SelfHost]: SelfHostContent,
		[QuickStartType.DevDeploy]: DevDeploymentContent,
	},
} as const
