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
		primaryBrandColor: '#744ED4',
		organizationDisplayName: 'Highlight.io',
		theme: {
			styles: [
				{
					key: 'custom-theme',
					type: 'style',
					value: `/* entire modal */
.ikp-modal-widget__content {
  border-radius: 8px;
  border: 1px solid #DCDBDD;
}

/* 'Ask AI' header */
.ikp-ai-chat__header-toolbar {
  background-color: #FDFCFD;
  border-bottom: 1px solid #DCDBDD;
  font-weight: 500;
}

/* Search and Ask AI switcher */
.ikp-switch-view-toggle {
  padding: 3px;
  gap: 3px;
  border-radius: 9px;
  background-color: #F4F2F4;
}

.ikp-search-bar-stand-alone {
  height: 30px;
}

.ikp-switch-view-toggle__button {
  background-color: #F4F2F4;
  color: #6F6E77;
}

.ikp-switch-view-toggle__button--active {
  color: white;
  padding: 4px 6px 4px 6px;
  border-radius: 6px;
  background-color: #744ED4;
  box-shadow: 0px -1px 0px 0px #00000052 inset;
}

.ikp-switch-view-toggle__button--active .ikp-switch-to-chat-icon,
.ikp-switch-view-toggle__button--active .ikp-switch-to-search-icon {
  color: white;
}

/* Get help button */
.ikp-get-help__button {
  background-color: #16161800;
  border: 1px solid #DCDBDD;
  border-radius: 4px;
  padding: 4px, 6px, 4px, 6px;
}

.ikp-get-help__button:hover {
  background-color: #1616180D;
}

.ikp-btn--variant_outline {
  background-color: #16161800;
  border: 1px solid #DCDBDD;
  border-radius: 4px;
  padding: 4px, 6px, 4px, 6px;
}

.ikp-btn--variant_outline:hover {
  background-color: #1616180D;
}

/* Search results tabs */
.ikp-search-result-tab {
  background-color: #16161800;
  border: 1px solid #DCDBDD;
  padding: 2px 10px 2px 10px;
  border-radius: 16px;
  color: #6F6E77;
}

.ikp-search-result-tab:hover {
  background-color: #1616180D;
  border: 1px solid #C8C7CB;
  color: #3E3E44;
}

.ikp-search-result-tab[data-selected] {
  background-color: #1616180D;
  border: 1px solid #C8C7CB;
  color: #3E3E44;
}

/* Result cards */
.ikp-result-card__container {
  background-color: #16161800;
  border-radius: 6px;
  border-color: transparent;
}

.ikp-result-card__container:hover {
  background-color: #1616180D;
}

.ikp-result-card__hover-icon {
  display: none;
}

/* github close badge */
.ikp-badge {
  background: var(--static-surface-sentiment-informative, #EDE7FE);
  padding: 2px, 4px, 2px, 4px;
  border-radius: 5px;
  box-shadow: none;
}

/* AI chat box */
.ikp-ai-chat__message-box {
  padding: 4px 6px 4px 6px;
  border-radius: 6px;
  border: 1px solid #DCDBDD;
  background: white;
  box-shadow: none;
  caret-color: #744ED4;
}

.ikp-ai-chat__message-box:hover {
  background-color: #1616180D;
  border-color: #C8C7CB;
}

/* Search bar */
.ikp-search-bar-stand-alone {
  padding: 0 6px 0 6px;
  border-radius: 6px;
  border: 1px solid #DCDBDD;
  background: white;
  box-shadow: none;
  caret-color: #744ED4;
  margin-right: 16px;
}

.ikp-search-bar-stand-alone:hover {
  background-color: #1616180D;
  border-color: #C8C7CB;
}

.ikp-search-bar-stand-alone__search-input:hover {
  background-color: transparent;
}

/* "Ask AI" card */
.ikp-ask-ai-card {
  background-color: #16161800;
  border-radius: 6px;
  border-color: transparent;
}

.ikp-ask-ai-card:hover {
  background-color: #1616180D;
}

.ikp-ask-ai-card svg:nth-child(2) {
  display: none;
}`,
				},
			],
			zIndex: {
				// header has z-index value of 20000
				overlay: 20001,
				modal: 20002,
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
