import styles from '../../components/Docs/Docs.module.scss'

export function MarkdownList(
	props: React.DetailedHTMLProps<
		React.HTMLAttributes<HTMLUListElement | HTMLOListElement>,
		HTMLUListElement | HTMLOListElement
	>,
) {
	return (
		<>
			{Array.isArray(props.children)
				? props?.children?.map((c: any, i: number) => {
						return (
							c.props &&
							c.props.children && (
								<li className={styles.listItem} key={i}>
									{c.props.children.map
										? c.props.children.map((e: any) => e)
										: c.props.children}
								</li>
							)
						)
				  })
				: null}
		</>
	)
}
