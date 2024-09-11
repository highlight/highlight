import EnterpriseFeatureButton from '@components/Billing/EnterpriseFeatureButton'
import { toast } from '@components/Toaster'
import {
	Box,
	ButtonIcon,
	IconSolidDocumentDownload,
} from '@highlight-run/ui/components'
import { vars } from '@highlight-run/ui/vars'
import { useGenerateSessionsReportCSV } from '@util/session/report'
import { H } from 'highlight.run'

export const SessionReport = () => {
	const { generateSessionsReportCSV } = useGenerateSessionsReportCSV()

	return (
		<Box marginLeft="auto" display="flex" gap="0">
			<EnterpriseFeatureButton
				setting="enable_session_export"
				name="Session CSV Report"
				fn={async () => {
					await toast.info(
						'Preparing CSV report, this may take a bit...',
					)
					try {
						await generateSessionsReportCSV()
						await toast.success(
							'CSV report prepared, downloading...',
						)
					} catch (e) {
						await toast.error(
							`Failed to generate the CSV report: ${e}`,
						)
						H.consumeError(e as Error)
					}
				}}
				variant="basic"
			>
				<ButtonIcon
					kind="secondary"
					size="small"
					shape="square"
					emphasis="low"
					icon={
						<IconSolidDocumentDownload
							size={16}
							color={
								vars.theme.interactive.fill.secondary.content
									.text
							}
						/>
					}
					onClick={() => {}}
				/>
			</EnterpriseFeatureButton>
		</Box>
	)
}
