export function MarkdownList(
	props: React.DetailedHTMLProps<
		React.HTMLAttributes<HTMLUListElement | HTMLOListElement>,
		HTMLUListElement | HTMLOListElement
	>,
) {
	if (!Array.isArray(props.children)) {
		return null
	}

	return (
		<ul
			style={{
				paddingLeft: 40,
			}}
			{...props}
		>
			{props.children.map((c: any, i: number) => {
				return (
					c.props &&
					c.props.children && (
						<li
							style={{
								listStyleType: 'disc',
								listStylePosition: 'outside',
							}}
							key={i}
						>
							{c.props.children.map
								? c.props.children.map((e: any) => e)
								: c.props.children}
						</li>
					)
				)
			})}
		</ul>
	)
}
