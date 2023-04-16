import { GetStaticProps } from 'next'
import { Tag } from '../../../components/Blog/Tag'
import {
	Blog,
	loadPostsFromGithub,
	loadPostsFromHygraph,
	loadTagsFromGithub,
	loadTagsFromHygraph,
} from '../index'

//get unique tags and prefer tags that have a description
export function getUniqueTags(tags: Tag[]): Tag[] {
	const uniqueTags: { [key: string]: Tag } = {}
	for (const tag of tags) {
		if (
			!uniqueTags[tag.slug] ||
			(!uniqueTags[tag.slug].description &&
				uniqueTags[tag.slug].description != null)
		) {
			uniqueTags[tag.slug] = tag
		}
	}
	return Object.values(uniqueTags)
}

export async function getStaticPaths(): Promise<{
	paths: string[]
	fallback: string
}> {
	const hygraphTags = await loadTagsFromHygraph()
	const githubPosts = await loadPostsFromGithub()
	const githubTags = await loadTagsFromGithub(githubPosts)

	let tags = [...hygraphTags, ...githubTags]
	tags = getUniqueTags(tags)

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

	tags.concat(githubTags)
	tags = getUniqueTags(tags)
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
