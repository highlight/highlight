import styles from '../../components/Docs/Docs.module.scss'

export function DocsCardGroup({ children }: React.PropsWithChildren) {
	return <div className={styles.docsCardGroup}>{children}</div>
}
