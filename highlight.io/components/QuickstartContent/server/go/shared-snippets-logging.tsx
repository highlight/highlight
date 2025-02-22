import { QuickStartStep } from '../../QuickstartContent'

export const logrusExample: (
	ctx: string,
	detailedEx?: string,
) => QuickStartStep[] = (ctx, detailedEx) => [
	{
		title: 'Call logrus methods while passing the request context.',
		content: `The request context allows highlight to associate logs with the incoming frontend session and network request.`,
		code: [
			{
				text: `logrus.WithContext(${ctx}).WithField("user", "bob").Infof("hello, %s!", "world")`,
				language: 'go',
			},
		],
	},
	...(detailedEx
		? [
				{
					title: 'Call the Highlight logging SDK.',
					content:
						'Use our SDK to configure [logrus](https://pkg.go.dev/github.com/sirupsen/logrus), and use it as normal.',
					code: [
						{
							text: detailedEx,
							language: 'go',
						},
					],
				},
			]
		: []),
]
