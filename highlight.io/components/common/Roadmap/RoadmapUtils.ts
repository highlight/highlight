import { gql } from 'graphql-request'

//converts "session-replay" to "Session Replay
export function tagToTitle(tag: string) {
	const words = tag.split('-')
	return words
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ')
}

function stringToEmoji(emoji: string) {
	switch (emoji) {
		case 'THUMBS_UP':
			return '👍'
		case 'THUMBS_DOWN':
			return '👎'
		case 'HOORAY':
			return '🎉'
		case 'CONFUSED':
			return '😕'
		case 'LAUGH':
			return '😄'
		case 'EYES':
			return '👀'
		case 'HEART':
			return '❤️'
		case 'ROCKET':
			return '🚀'
		default:
			return '👍'
	}
}

export const labels = ['2025 Q1']

export const query = gql`
	query {
		node(id: "PVT_kwDOBIbbWs4AMuHC") {
			... on ProjectV2 {
				items(first: 40) {
					nodes {
						fieldValueByName(name: "Status") {
							... on ProjectV2ItemFieldSingleSelectValue {
								name
							}
						}
						content {
							... on Issue {
								title
								url
								reactions(first: 50) {
									nodes {
										content
									}
								}
								labels(first: 5) {
									nodes {
										name
									}
								}

								number
							}
						}
					}
				}
			}
		}
	}
`

export type IssueReaction = {
	content: string
	count: number
}

export type Issue = {
	title: string
	number: string
	labels: string[]
	issueReactions?: IssueReaction[]
	link: string
	linkText: string
}

export type RoadmapProps = {
	column1: Issue[]
	column2: Issue[]
	column3: Issue[]
}

const token = process.env.GITHUB_TOKEN

const options = {
	method: 'POST',
	headers: {
		'Content-Type': 'application/json',
		accept: 'application/vnd.github+json',
		authorization: `Bearer ${token}`,
	},
	body: JSON.stringify({ query }),
}

export const roadmapFetcher = async (): Promise<{
	column1: Issue[]
	column2: Issue[]
	column3: Issue[]
}> => {
	let column1: Issue[] = []
	let column2: Issue[] = []
	let column3: Issue[] = []
	if (!token) {
		return { column1, column2, column3 }
	}

	const response = await fetch('https://api.github.com/graphql', options)
	const { data } = await response.json()
	if (!data) {
		return { column1, column2, column3 }
	}

	let issues = data.node.items.nodes

	for (let i = 0; i < issues.length; i++) {
		let content = issues[i].content
		let issueReactions: IssueReaction[] = []

		if (!content) {
			continue
		}

		if (content && content.reactions) {
			const frequencyDict = content.reactions.nodes.reduce(
				(acc: { [key: string]: number }, cur: { content: string }) => {
					const content = cur.content
					if (!acc[stringToEmoji(content)]) {
						acc[stringToEmoji(content)] = 1
					} else {
						acc[stringToEmoji(content)]++
					}
					return acc
				},
				{},
			)

			for (const key in frequencyDict) {
				const value = frequencyDict[key]
				issueReactions.push({ content: key, count: value })
			}
		}

		let labels: string[] = []
		if (content && content.labels) {
			labels = content.labels.nodes
				.filter((label: any) => label)
				.map((label?: { name: string }) => label?.name)
		}

		let issue: Issue = {
			title: content.title,
			number: content.number,
			labels: labels,
			link: content.url,
			linkText: 'Vote on GitHub',
			issueReactions: issueReactions,
		}

		if (issue.title == undefined) {
			continue
		}

		if (issues[i].fieldValueByName?.name === 'Planned') {
			column1.push(issue)
		} else if (issues[i].fieldValueByName?.name === 'In Progress') {
			column2.push(issue)
		} else if (issues[i].fieldValueByName?.name === 'Done') {
			issue.linkText = 'Read the Changelog'
			issue.link = '/docs/general/changelog/overview'
			column3.push(issue)
		}
	}

	return { column1, column2, column3 }
}
