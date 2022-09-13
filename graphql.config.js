module.exports = {
	projects: {
		backendPrivate: {
			schema: './backend/private-graph/graph/schema.graphqls',
		},
		backendPublic: {
			schema: './backend/public-graph/graph/schema.graphqls',
		},
		frontend: {
			schema: './backend/private-graph/graph/schema.graphqls',
			documents: './frontend/**/*.gql',
		},
	},
}
