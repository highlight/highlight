import { GetStaticProps } from 'next'
import { getUniqueTags } from '../../../components/Blog/BlogPost/BlogPost'
import { Tag } from '../../../components/Blog/Tag'
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
		return post.tags_relations.some((tag: Tag) => {
			return tag.slug === (params!.tag as string)
		})
	})

	tags.concat(githubTags)
	tags = getUniqueTags(tags)
	posts = [...filteredPosts, ...posts]
	posts.sort((a, b) => Date.parse(b.postedAt) - Date.parse(a.postedAt))

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
