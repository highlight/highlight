import React from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, gql } from "@apollo/client";

const OrgPage = props => {
	const { organization_id } = useParams();
	const { loading, error, data } = useQuery(
		gql`
			query GetUsers($organization_id: ID!) {
				users(organization_id: $organization_id) {
					id
				}
			}
		`,
		{ variables: { organization_id: organization_id } }
	);
	if (loading) {
		return <p>loading...</p>;
	}
	if (error) {
		return <p>{error.toString()}</p>;
	}
	return (
		<div style={{ margin: 20, display: "flex", flexDirection: "column" }}>
			<p>Users</p>
			{data?.users?.map(u => (
				<Link
					style={{ marginTop: 20 }}
					to={`${props.match.url}/${u.id}`}
				>
					{u.id}
				</Link>
			))}
		</div>
	);
};

export default OrgPage;
