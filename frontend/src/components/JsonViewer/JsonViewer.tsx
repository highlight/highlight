import {
	Box,
	ButtonIcon,
	IconSolidDownload,
	Text,
	Tooltip,
} from '@highlight-run/ui/components'
// @ts-expect-error
import { specific } from 'react-files-hooks'
import ReactJson, { ReactJsonViewProps } from 'react-json-view'

import styles from './JsonViewer.module.css'

type Props = { allowDownload?: boolean; downloadFileName?: string } & Pick<
	ReactJsonViewProps,
	'src' | 'collapsed' | 'name' | 'style'
>

const JsonViewer = ({
	collapsed = 1,
	name = null,
	allowDownload = false,
	downloadFileName = 'highlight-json',
	style,
	...props
}: Props) => {
	const { download } = specific.useJSONDownloader()

	if (props.src === null) {
		return null
	}

	return (
		<div className={styles.container}>
			{allowDownload && (
				<Tooltip
					trigger={
						<ButtonIcon
							cssClass={styles.downloadButton}
							trackingId="JsonViewerDownload"
							kind="secondary"
							size="xSmall"
							shape="square"
							emphasis="low"
							icon={<IconSolidDownload />}
							onClick={() => {
								download({
									data: JSON.stringify(props.src, undefined, 2),
									name: downloadFileName,
								})
							}}
						/>
					}
					delayed
				>
					<Box p="4">
						<Text userSelect="none" color="n11">
							Download this as JSON
						</Text>
					</Box>
				</Tooltip>
			)}
			<ReactJson
				{...props}
				collapsed={collapsed}
				displayDataTypes={false}
				collapseStringsAfterLength={100}
				iconStyle="square"
				quotesOnKeys={false}
				name={name}
				style={{
					wordBreak: 'break-word',
					fontFamily: 'var(--monospace-font-family)',
					...style,
				}}
			/>
		</div>
	)
}

export default JsonViewer
