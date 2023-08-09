import { GetStaticProps } from 'next'
import { getUniqueTags } from '../../../components/Blog/BlogPost/BlogPost'
import { Tag } from '../../../components/Blog/Tag'
import { Blog, loadPostsFromGithub, loadTagsFromGithub } from '../index'

export async function getStaticPaths(): Promise<{
	paths: string[]
	fallback: string
}> {
	const posts = await loadPostsFromGithub()
	let tags = await loadTagsFromGithub(posts)

	tags = getUniqueTags(tags)

	return {
		paths: tags.map((tag) => `/blog/tag/${tag}`),
		fallback: 'blocking',
	}
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
	let posts = await loadPostsFromGithub()
	let tags = await loadTagsFromGithub(posts)

	posts = posts.filter((post) => {
		return post.tags_relations.some((tag: Tag) => {
			return tag.slug === (params!.tag as string)
		})
	})

	tags = getUniqueTags(tags)
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
