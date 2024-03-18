import {
	Box,
	IconSolidCheveronLeft,
	IconSolidCode,
	Stack,
	Table,
	Text,
} from '@highlight-run/ui/components'
import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

import { Button } from '@/components/Button'
import { Skeleton } from '@/components/Skeleton'
import {
	useFindSimilarErrorsQuery,
	useMatchErrorTagQuery,
} from '@/graph/generated/hooks'

import styles from './ErrorTags.module.css'

const GRID_COLUMNS = ['10rem', '1fr', '5rem']

export function ErrorTagsSearch() {
	const [searchParams] = useSearchParams()
	const query = useMemo(
		() => atob(searchParams.get('q') ?? ''),
		[searchParams],
	)
	const { data: tagData, loading: tagLoading } = useMatchErrorTagQuery({
		variables: { query },
		skip: !query,
	})
	const { data: similarData, loading: similarLoading } =
		useFindSimilarErrorsQuery({
			variables: { query },
			skip: !query,
		})

	return (
		<Stack py="32" gap="32">
			<Box style={{ display: 'flex', justifyContent: 'space-between' }}>
				<Link to="/error-tags">
					<Button
						trackingId="error-tags-search-go-back"
						iconLeft={<IconSolidCheveronLeft />}
						kind="secondary"
						cssClass={styles.goBackButton}
					>
						Go back
					</Button>
				</Link>
				<ShareButton />
			</Box>

			<Box cssClass={styles.bordered}>
				<Box
					style={{
						display: 'flex',
						alignItems: 'center',
						gap: '0.25rem',
					}}
				>
					<IconSolidCode />
					<Text>Imported error text</Text>
				</Box>
				<Box
					style={{
						fontSize: '0.8125rem',
						marginTop: '0.75rem',
					}}
				>
					{query}
				</Box>
			</Box>

			<Box>
				<Text cssClass={styles.tableHeaderText}>
					Matching error tags
				</Text>

				{tagLoading ? (
					<Skeleton height="10rem" width="100%" />
				) : (
					<Table>
						<Table.Head className={styles.searchTableHead}>
							<Table.Row gridColumns={GRID_COLUMNS}>
								<Table.Cell>Title</Table.Cell>
								<Table.Cell>Description</Table.Cell>
								<Table.Cell>Score</Table.Cell>
							</Table.Row>
						</Table.Head>
						<Table.Body>
							{tagData?.match_error_tag?.map((tag) => (
								<Table.Row
									gridColumns={GRID_COLUMNS}
									key={tag?.id}
								>
									<Table.Cell>
										<Text
											cssClass={styles.titleText}
											title={tag?.title}
										>
											{tag?.title}
										</Text>
									</Table.Cell>
									<Table.Cell>
										<Text
											cssClass={styles.titleDescription}
										>
											{tag?.description}
										</Text>
									</Table.Cell>
									<Table.Cell>
										<Score score={tag?.score} />
									</Table.Cell>
								</Table.Row>
							)) || <NoResults />}
						</Table.Body>
					</Table>
				)}
			</Box>
			<Box>
				<Text cssClass={styles.tableHeaderText}>Similar errors</Text>

				{similarLoading ? (
					<Skeleton height="10rem" width="100%" />
				) : (
					<Table>
						<Table.Head className={styles.searchTableHead}>
							<Table.Row gridColumns={GRID_COLUMNS}>
								<Table.Cell>Title</Table.Cell>
								<Table.Cell>Stack Trace</Table.Cell>
								<Table.Cell>Score</Table.Cell>
							</Table.Row>
						</Table.Head>
						<Table.Body>
							{similarData?.find_similar_errors?.map((error) => (
								<Table.Row
									gridColumns={GRID_COLUMNS}
									key={error?.id}
								>
									<Table.Cell>
										<Text
											cssClass={styles.titleText}
											title={error?.event.join(', ')}
										>
											{error?.event.join(', ')}
										</Text>
									</Table.Cell>
									<Table.Cell>
										<Text
											cssClass={styles.titleDescription}
										>
											{error?.stack_trace}
										</Text>
									</Table.Cell>
									<Table.Cell>
										<Score score={error?.score} />
									</Table.Cell>
								</Table.Row>
							)) || <NoResults />}
						</Table.Body>
					</Table>
				)}
			</Box>
		</Stack>
	)
}

function Score({ score = 0 }: { score?: number }) {
	const normalizedScore = roundScore(score)
	const { backgroundColor, color } = useMemo(() => {
		switch (true) {
			case normalizedScore < 0.3:
				return {
					backgroundColor:
						'var(--static-surface-sentiment-good, #CCEBD7)',
					color: '#18794E',
				}

			case normalizedScore < 0.7:
				return {
					backgroundColor:
						'var(--static-surface-sentiment-caution, #FFE3A2)',
					color: '#1A1523B8',
				}

			default:
				return {
					backgroundColor:
						'var(--static-surface-sentiment-bad, #FDD8D8)',
					color: '#CD2B31',
				}
		}
	}, [normalizedScore])

	return (
		<Box
			style={{
				backgroundColor,
				color,
				borderRadius: 5,
				fontSize: '0.75rem',
				padding: '0.13rem 0.25rem',
			}}
		>
			{roundScore(1 - score)}
		</Box>
	)
}

function roundScore(score: number) {
	return score ? Math.round(score * 100) / 100 : 0
}

function NoResults() {
	return <Box cssClass={styles.noResults}>No results</Box>
}

function ShareButton() {
	const [isPopoverOpen, setIsPopoverOpen] = useState(false)

	function onShareClick() {
		navigator.clipboard?.writeText(window.location.href)
		setIsPopoverOpen(true)

		setTimeout(() => setIsPopoverOpen(false), 2000)
	}

	return (
		<>
			{isPopoverOpen && (
				<Box cssClass={styles.alert}>
					<Box>Copied URL</Box>
				</Box>
			)}

			<Button
				trackingId="error-tags-search-go-back"
				kind="secondary"
				cssClass={styles.shareButton}
				onClick={onShareClick}
			>
				Share
			</Button>
		</>
	)
}
