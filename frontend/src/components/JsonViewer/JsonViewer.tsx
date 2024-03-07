import Button from '@components/Button/Button/Button'
import Tooltip from '@components/Tooltip/Tooltip'
import SvgDownloadIcon from '@icons/DownloadIcon'
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
				<Tooltip title="Download this as JSON" placement="left">
					<Button
						className={styles.downloadButton}
						trackingId="JsonViewerDownload"
						iconButton
						type="text"
						size="small"
						onClick={() => {
							download({
								data: JSON.stringify(props.src, undefined, 2),
								name: downloadFileName,
							})
						}}
					>
						<SvgDownloadIcon />
					</Button>
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
