import {
	Box,
	ButtonIcon,
	IconSolidClipboardCopy,
	IconSolidDownload,
	Text,
} from '@highlight-run/ui'
import ExplanatoryPopover from '@pages/Player/Toolbar/ExplanatoryPopover/ExplanatoryPopover'
import { copyToClipboard } from '@util/string'
import React from 'react'
import ReactCollapsible from 'react-collapsible'
// @ts-expect-error
import { specific } from 'react-files-hooks'

import * as styles from './JsonViewerV2.css'

type Props = {
	title: React.ReactElement
	data: object
	downloadFileName?: string
}

const JsonViewerV2 = React.memo(
	({ title, data, downloadFileName = 'highlight-json' }: Props) => {
		const { download } = specific.useJSONDownloader()

		if (data === null) {
			return null
		}

		const allKeys = new Set<string>()
		JSON.stringify(data, (key, value) => {
			allKeys.add(key)
			return value
		})
		const objectStr = JSON.stringify(data, Array.from(allKeys).sort(), 2)

		return (
			<Box className={styles.container}>
				<Box cssClass={styles.downloadButton}>
					<ExplanatoryPopover
						content={
							<>
								<Text userSelect="none" color="n11">
									Copy to Clipboard
								</Text>
							</>
						}
					>
						<ButtonIcon
							kind="secondary"
							size="xSmall"
							shape="square"
							emphasis="low"
							icon={<IconSolidClipboardCopy />}
							onClick={() => {
								copyToClipboard(JSON.stringify(data))
							}}
						/>
					</ExplanatoryPopover>
					<ExplanatoryPopover
						content={
							<>
								<Text userSelect="none" color="n11">
									Download this as JSON
								</Text>
							</>
						}
					>
						<ButtonIcon
							kind="secondary"
							size="xSmall"
							shape="square"
							emphasis="low"
							icon={<IconSolidDownload />}
							onClick={() => {
								download({
									data: JSON.stringify(data, undefined, 2),
									name: downloadFileName,
								})
							}}
						/>
					</ExplanatoryPopover>
				</Box>
				<ReactCollapsible
					trigger={title}
					open={true}
					handleTriggerClick={() => {}}
					transitionTime={150}
					contentInnerClassName={styles.jsonContainer}
				>
					<Text
						family="monospace"
						weight="bold"
						size="xxSmall"
						cssClass={styles.consoleText}
					>
						{objectStr}
					</Text>
				</ReactCollapsible>
			</Box>
		)
	},
)

export default JsonViewerV2
