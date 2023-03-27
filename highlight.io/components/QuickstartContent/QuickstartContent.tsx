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
import { AngularContent } from './frontend/angular'
import { GatsbyContent } from './frontend/gatsby'
import { NextContent } from './frontend/next'
import { OtherContext } from './frontend/other'
import { ReactContent } from './frontend/react'
import { SvelteKitContent } from './frontend/sveltekit'
import { VueContent } from './frontend/vue'
import { GoLogrusContent } from './logging/go/logrus'
import { GoOtherLogContent } from './logging/go/other'
import { HTTPContent } from './logging/http'
import { JSNestLogContent } from './logging/js/nestjs'
import { JSOtherLogContent } from './logging/js/other'
import { PythonOtherLogContent } from './logging/python/other'
import { DevDeploymentContent } from './self-host/dev-deploy'
import { SelfHostContent } from './self-host/self-host'

export type QuickStartContent = {
  title: string
  subtitle: string
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
  JStRPC = 'trpc',
  HTTPOTLP = 'http-otlp',
}

export const quickStartContent = {
  client: {
    title: 'Client SDKs',
    subtitle: 'Select a client SDK to get started.',
    js: {
      title: 'Select your client framework',
      subtitle:
        'Select a client SDK to install session replay, error monitoring, and logging for your frontend application.',
      [QuickStartType.React]: ReactContent,
      [QuickStartType.Angular]: AngularContent,
      [QuickStartType.Next]: NextContent,
      [QuickStartType.Vue]: VueContent,
      [QuickStartType.Gatsby]: GatsbyContent,
      [QuickStartType.Other]: OtherContext,
    },
    // Returning this as part of the base object so we don't break the old docs.
    // We can remove this once the app-side changes are deployed.
    [QuickStartType.React]: ReactContent,
    [QuickStartType.Angular]: AngularContent,
    [QuickStartType.Next]: NextContent,
    [QuickStartType.Vue]: VueContent,
    [QuickStartType.Gatsby]: GatsbyContent,
    [QuickStartType.SvelteKit]: SvelteKitContent,
    [QuickStartType.Other]: OtherContext,
  },
  backend: {
    title: 'Select your backend language',
    subtitle:
      'Select a backend language to see the SDKs available for setting up error monitoring and logging for your application.',
    python: {
      title: 'Python',
      subtitle: 'Select your Python framework to install error monitoring for your application.',
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
      subtitle: 'Select your Go framework to install error monitoring for your application.',
      [QuickStartType.GoGqlgen]: GoGqlgenContent,
      [QuickStartType.GoFiber]: GoFiberContent,
      [QuickStartType.GoChi]: GoChiContent,
      [QuickStartType.GoMux]: GoMuxContent,
      [QuickStartType.GoGin]: GoGinContent,
    },
    js: {
      title: 'JavaScript',
      subtitle: 'Select your JavaScript framework to install error monitoring for your application.',
      [QuickStartType.JSApollo]: JSApolloContent,
      [QuickStartType.JSCloudflare]: JSCloudflareContent,
      [QuickStartType.JSExpress]: JSExpressContent,
      [QuickStartType.JSFirebase]: JSFirebaseContent,
      [QuickStartType.JSNodejs]: JSNodeContent,
      [QuickStartType.JSNestjs]: JSNestContent,
      [QuickStartType.JStRPC]: JStRPCContent,
    },
  },
  'backend-logging': {
    title: 'Select your language',
    subtitle: 'Select your backend language to install logging in your application.',
    python: {
      title: 'Python',
      subtitle: 'Select your Python framework to install logging in your application.',
      [QuickStartType.PythonOther]: PythonOtherLogContent,
    },
    go: {
      title: 'Go',
      subtitle: 'Select your Go framework to install logging in your application.',
      [QuickStartType.GoLogrus]: GoLogrusContent,
      [QuickStartType.GoOther]: GoOtherLogContent,
    },
    js: {
      title: 'JavaScript',
      subtitle: 'Select your JavaScript framework to install logging in your application.',
      [QuickStartType.JSNodejs]: JSOtherLogContent,
      [QuickStartType.JSNestjs]: JSNestLogContent,
    },
    http: {
      title: 'HTTP/OTLP',
      subtitle: 'Get started with logging in your application via HTTP or OTLP.',
      [QuickStartType.HTTPOTLP]: HTTPContent,
    },
  },
  other: {
    [QuickStartType.SelfHost]: SelfHostContent,
    [QuickStartType.DevDeploy]: DevDeploymentContent,
  },
} as const
