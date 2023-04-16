import { GetStaticProps } from 'next'
import {
	Blog,
	loadPostsFromGithub,
	loadPostsFromHygraph,
	loadTagsFromGithub,
	loadTagsFromHygraph,
} from '../index'

export async function getStaticPaths(): Promise<{
	paths: string[]
	fallback: string
}> {
	const hygraphTags = await loadTagsFromHygraph()
	const githubPosts = await loadPostsFromGithub()
	const githubTags = await loadTagsFromGithub(githubPosts)

	let tags = [...hygraphTags, ...githubTags]
	tags = [...new Set(tags)]

	return {
		paths: tags.map((tag) => `/blog/tag/${tag}`),
		fallback: 'blocking',
	}
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
	const postsRequest = loadPostsFromHygraph(params!.tag as string)
	const tagsRequest = loadTagsFromHygraph()
	const githubPosts = await loadPostsFromGithub()
	const githubTags = await loadTagsFromGithub(githubPosts)
	let [posts, tags] = await Promise.all([postsRequest, tagsRequest])

	let filteredPosts = githubPosts.filter((post) => {
		return post.tags.includes(params!.tag as string)
	})

	console.log(filteredPosts)

	tags.concat(githubTags)
	tags = [...new Set(tags)]
	posts = [...filteredPosts, ...posts]

	return {
		props: {
			posts,
			tags,
			currentTagSlug: params!.tag,
		},
		revalidate: 60,
	}
}

export default Blog
