import { consoleText } from '@components/TextViewer/TextViewer.css'
import {
	Box,
	ButtonIcon,
	IconSolidClipboardCopy,
	IconSolidDownload,
	Text,
	Tooltip,
} from '@highlight-run/ui/components'
import { copyToClipboard } from '@util/string'
import React from 'react'
// @ts-ignore
import { specific } from 'react-files-hooks'

import { Button } from '@/components/Button'
import { styledHorizontalScrollbar } from '@/style/common.css'

type Props = {
	title: React.ReactElement<any>
	data: object
	downloadFileName?: string
	repr?: React.ReactElement<any>
}

const TextViewer = React.memo(
	({ title, data, downloadFileName = 'highlight-json', repr }: Props) => {
		const { download } = specific.useJSONDownloader()
		const [truncated, setTruncated] = React.useState(false)

		if (data === null) {
			return null
		}

		const allKeys = new Set<string>()
		JSON.stringify(data, (key, value) => {
			allKeys.add(key)
			return value
		})
		const objectStr = JSON.stringify(data, Array.from(allKeys).sort(), 2)
		const isTruncated = objectStr.length > 15000 && !truncated

		return (
			<Box width="full" display="flex" flexDirection="column" gap="4">
				<Box display="flex" alignItems="center">
					{title}
					<Box ml="auto" display="flex" gap="2">
						<Tooltip
							trigger={
								<ButtonIcon
									kind="secondary"
									size="xSmall"
									shape="square"
									emphasis="low"
									icon={<IconSolidClipboardCopy />}
									onClick={() => {
										copyToClipboard(JSON.stringify(data), {
											onCopyText:
												'Copied text to clipboard.',
										})
									}}
								/>
							}
							delayed
						>
							<Box p="4">
								<Text userSelect="none" color="n11">
									Copy to Clipboard
								</Text>
							</Box>
						</Tooltip>
						<Tooltip
							trigger={
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
							}
							delayed
						>
							<Box p="4">
								<Text userSelect="none" color="n11">
									Download this as JSON
								</Text>
							</Box>
						</Tooltip>
					</Box>
				</Box>

				<Box
					color="moderate"
					px="4"
					py="2"
					borderRadius="5"
					border="dividerWeak"
					background="nested"
					overflowX="auto"
					overflowY="hidden"
					cssClass={styledHorizontalScrollbar}
				>
					{!!repr ? (
						repr
					) : isTruncated ? (
						<Box pt="12" px="6" pb="4" textAlign="center">
							<Box pb="12">
								<Text>
									Payload is large and could be difficult to
									view in the browser.
								</Text>
							</Box>
							<Button
								onClick={() => setTruncated(!truncated)}
								trackingId="open-json-payload"
							>
								Show payload
							</Button>
						</Box>
					) : (
						<Text
							as="span"
							family="monospace"
							size="xxSmall"
							cssClass={consoleText}
						>
							{objectStr}
						</Text>
					)}
				</Box>
			</Box>
		)
	},
)

export default TextViewer
