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
// @ts-ignore
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
			<Box width="full" display="flex" flexDirection="column" gap="4">
				<Box display="flex" alignItems="center">
					{title}
					<Box ml="auto" display="flex" gap="2">
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
									copyToClipboard(JSON.stringify(data), {
										onCopyText: 'Copied text to clipboard.',
									})
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
										data: JSON.stringify(
											data,
											undefined,
											2,
										),
										name: downloadFileName,
									})
								}}
							/>
						</ExplanatoryPopover>
					</Box>
				</Box>
				<Box
					color="moderate"
					px="4"
					py="2"
					borderRadius="5"
					border="dividerWeak"
					background="nested"
				>
					<Text
						as="span"
						family="monospace"
						weight="bold"
						size="xxSmall"
						cssClass={styles.consoleText}
					>
						{objectStr}
					</Text>
				</Box>
			</Box>
		)
	},
)

export default JsonViewerV2
