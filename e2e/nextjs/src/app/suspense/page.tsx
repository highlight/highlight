export default async function Page() {
	const response = await fetch('https://pub.highlight.io/v1/logs/json', {
		method: 'POST',
		body: JSON.stringify({}),
		headers: {
			'x-highlight-project': '2',
			'x-highlight-service': 'next-suspense',
		},
	})
	const data = await response.text()
	await new Promise((resolve) =>
		setTimeout(resolve, Math.random() * 3 * 1000),
	)
	return (
		<div>
			<p>YO THIS IS AN ASYNC PAGE</p>
			<p>{data}</p>
		</div>
	)
}
