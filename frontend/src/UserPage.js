import React from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, gql } from "@apollo/client";

const UserPage = props => {
	const { organization_id, user_id } = useParams();
	const { loading, error, data } = useQuery(
		gql`
			query GetSessions($user_id: ID!, $organization_id: ID!) {
				sessions(user_id: $user_id, organization_id: $organization_id) {
					id
				}
			}
		`,
		{ variables: { user_id: user_id, organization_id: organization_id } }
	);
	if (loading) {
		return <p>loading...</p>;
	}
	if (error) {
		return <p>{error.toString()}</p>;
	}
	return (
		<div
			style={{
				margin: 20,
				display: "flex",
				flexDirection: "column",
				overflow: "scroll"
			}}
		>
			<p>Sessions</p>
			{data?.sessions?.map(s => (
				<Link
					style={{ marginTop: 20 }}
					to={`${props.match.url}/${s.id}`}
				>
					{s.id}
				</Link>
			))}
		</div>
	);
};

export default UserPage;
