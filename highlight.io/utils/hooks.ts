import type {
	InkeepAIChatSettings,
	InkeepSearchSettings,
	InkeepBaseSettings,
	InkeepModalSettings,
} from '@inkeep/cxkit-react'

type InkeepSharedSettings = {
	baseSettings: InkeepBaseSettings
	aiChatSettings: InkeepAIChatSettings
	searchSettings: InkeepSearchSettings
	modalSettings: InkeepModalSettings
}

const useInkeepSettings = (): InkeepSharedSettings => {
	const baseSettings: InkeepBaseSettings = {
		apiKey: '3721b3f00a2e161d2eb143932695e984a9db05ffb89bdb57',
		primaryBrandColor: '#6C37F4',
		organizationDisplayName: 'Highlight.io',
		theme: {
			styles: [
				{
					key: 'custom-theme',
					type: 'style',
					value: `.ikp-search-bar-trigger__container {
  border-radius: 40px;
  margin: 0 16px;
  border: 1px solid var(--divider-on-dark) !important;
  background-color: var(--color-primary-background);
  width: fit-content;
}

@media screen and (max-width: 768px) {
  .ikp-search-bar-trigger__container {
    width: fit-content;
    margin: 0;
  }

  .ikp-search-bar-trigger__icon {
    margin: 0;
  }

  .ikp-search-bar-trigger__kbd,
  .ikp-search-bar-trigger__text {
    display: none;
  }
}

@media screen and (max-width: 1200px) {
  .ikp-search-bar-trigger__container {
    height: var(--ikp-sizes-7);
  }
}`,
				},
			],
			fontFamily: {
				body: "'Poppins",
				heading: "'Poppins'",
				mono: "'IBM Plex Mono'",
			},
		},
	}

	const modalSettings: InkeepModalSettings = {}

	const searchSettings: InkeepSearchSettings = {
		placeholder: 'Search',
	}

	const aiChatSettings: InkeepAIChatSettings = {
		chatSubjectName: 'Highlight.io',
		aiAssistantAvatar:
			'https://storage.googleapis.com/organization-image-assets/highlightio-botAvatarSrcUrl-1718084264557.svg',
		getHelpOptions: [
			{
				name: 'Discord',
				action: {
					type: 'open_link',
					url: 'https://discord.gg/yxaXEAqgwN',
				},
				icon: {
					builtIn: 'FaDiscord',
				},
			},
			{
				name: 'Github',
				action: {
					type: 'open_link',
					url: 'https://github.com/highlight/highlight',
				},
				icon: {
					builtIn: 'FaGithub',
				},
			},
		],
		exampleQuestions: [
			'How do I filter out sensitive data?',
			'What backend languages are supported?',
			'How do I record canvas or WebGL?',
		],
	}

	return { baseSettings, aiChatSettings, searchSettings, modalSettings }
}

export default useInkeepSettings
