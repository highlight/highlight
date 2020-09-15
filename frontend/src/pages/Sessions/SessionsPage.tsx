import React from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, gql } from "@apollo/client";
import { useLocation } from "react-router-dom";
import styles from "./SessionsPage.module.css";
import { ReactComponent as PlayButton } from "../../static/play-button.svg";
import { Skeleton } from "antd";

export const SessionsPage = () => {
	const location = useLocation();
	const { organization_id } = useParams();
	const { loading, error, data } = useQuery<
		{ sessions: any[] },
		{ organization_id: number }
	>(
		gql`
			query GetSessions($organization_id: ID!) {
				sessions(organization_id: $organization_id) {
					id
					details
					user_id
					identifier
					created_at
				}
			}
		`,
		{ variables: { organization_id: organization_id } }
	);
	if (error) {
		return <p>{error.toString()}</p>;
	}
	return (
		<div className={styles.setupWrapper}>
			<div className={styles.sessionsSection}>
				<div className={styles.sessionsHeader}>Session Playlist</div>
				{loading ? (
					<Skeleton />
				) : (
					data?.sessions?.map(u => {
						const created = new Date(u.created_at);
						const d = JSON.parse(u.details);
						return (
							<Link
								to={`${location.pathname}/${u.id}`}
								key={u.id}
							>
								<div className={styles.sessionCard}>
									<div className={styles.playButton}>
										<PlayButton />
									</div>
									<div className={styles.sessionTextWrapper}>
										<div
											className={
												styles.sessionTextSection
											}
										>
											<div
												className={styles.blueTitle}
											>{`User#${u?.user_id}`}</div>
											<div className={styles.regSubTitle}>
												{u?.identifier}
											</div>
										</div>
										<div
											className={
												styles.sessionTextSection
											}
										>
											<div className={styles.blueTitle}>
												{created.toLocaleString(
													"en-us",
													{
														day: "numeric",
														month: "short",
														minute: "numeric",
														hour: "numeric"
													}
												)}
											</div>
											<div className={styles.regSubTitle}>
												30 min 20 sec
											</div>
										</div>
										<div
											className={
												styles.sessionTextSection
											}
										>
											<div className={styles.regTitle}>
												{d?.browser?.os &&
												d?.browser?.name
													? d?.browser?.os +
													  " • " +
													  d?.browser?.name
													: "Desktop • Chrome"}
											</div>
											<div className={styles.regSubTitle}>
												{d?.city}, {d?.state}{" "}
												{d?.postal}
											</div>
										</div>
									</div>
								</div>
							</Link>
						);
					})
				)}
			</div>
		</div>
	);
};
