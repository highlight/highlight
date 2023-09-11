import { LinkButton } from '@components/LinkButton'
import { Box, IconSolidArrowSmLeft } from '@highlight-run/ui'
import SvgHighlightLogoOnLight from '@icons/HighlightLogoOnLight'
import { Outlet } from 'react-router-dom'

import headerStyles from '../../components/Header/Header.module.css'

export function ErrorTagsContainer() {
	return (
		<Box background="n2" minHeight="full">
			<Box background="n2" borderBottom="secondary">
				<Box
					display="flex"
					alignItems="center"
					px="12"
					py="8"
					justifyContent="space-between"
				>
					<Box
						display="flex"
						justifyContent="space-between"
						width="full"
					>
						<LinkButton
							to="/"
							kind="secondary"
							emphasis="low"
							size="small"
							iconLeft={<IconSolidArrowSmLeft size={14} />}
							trackingId="navHomeLink"
						>
							Back to Highlight
						</LinkButton>
						<a
							className={headerStyles.homeLink}
							href="https://www.highlight.io"
						>
							<SvgHighlightLogoOnLight width={28} height={28} />
						</a>
					</Box>
				</Box>
			</Box>
			<Box
				style={{
					display: 'flex',
					justifyContent: 'center',
					padding: 8,
					minHeight: 'calc(100vh - 45px)',
				}}
			>
				<Box
					style={{
						display: 'flex',
						justifyContent: 'center',
						background: 'white',
						border: '1px solid #E4E2E4',
						borderRadius: 6,
						minHeight: '100%',
						width: '100%',
					}}
				>
					<Box style={{ width: 720 }}>
						<Box
							style={{
								minHeight: '60vh',
								padding: '3rem 0',
								display: 'flex',
								flexDirection: 'column',
								justifyContent: 'center',
							}}
						>
							<Outlet />
						</Box>
					</Box>
				</Box>
			</Box>
		</Box>
	)
}
