import type {
	InkeepAIChatSettings,
	InkeepSearchSettings,
	InkeepBaseSettings,
	InkeepModalSettings,
} from '@inkeep/uikit'

type InkeepSharedSettings = {
	baseSettings: InkeepBaseSettings
	aiChatSettings: InkeepAIChatSettings
	searchSettings: InkeepSearchSettings
	modalSettings: InkeepModalSettings
}

const useInkeepSettings = (): InkeepSharedSettings => {
	const baseSettings: InkeepBaseSettings = {
		apiKey: '3721b3f00a2e161d2eb143932695e984a9db05ffb89bdb57',
		integrationId: 'clxout8nk014hvhjs0jc5ccfb',
		organizationId: 'org_k9k0yeE7ovNoTgrC',
		primaryBrandColor: '#6C37F4',
		organizationDisplayName: 'Highlight.io',
		theme: {
			stylesheetUrls: ['/styles/inkeep.css'],
			tokens: {
				fonts: {
					body: "'Poppins",
					heading: "'Poppins'",
					mono: "'IBM Plex Mono'",
				},
			},
		},
	}

	const modalSettings: InkeepModalSettings = {}

	const searchSettings: InkeepSearchSettings = {
		placeholder: 'Search',
	}

	const aiChatSettings: InkeepAIChatSettings = {
		chatSubjectName: 'Highlight.io',
		botAvatarSrcUrl:
			'https://storage.googleapis.com/organization-image-assets/highlightio-botAvatarSrcUrl-1718084264557.svg',
		getHelpCallToActions: [
			{
				name: 'Discord',
				url: 'https://discord.gg/yxaXEAqgwN',
				icon: {
					builtIn: 'FaDiscord',
				},
			},
			{
				name: 'Github',
				url: 'https://github.com/highlight/highlight',
				icon: {
					builtIn: 'FaGithub',
				},
			},
		],
		quickQuestions: [
			'How do I filter out sensitive data?',
			'What backend languages are supported?',
			'How do I record canvas or WebGL?',
		],
	}

	return { baseSettings, aiChatSettings, searchSettings, modalSettings }
}

export default useInkeepSettings
