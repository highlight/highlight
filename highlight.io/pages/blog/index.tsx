import { GetStaticProps } from 'next'
import { loadPostsFromGithub, VALID_TAGS } from '../../shared/blog'
import BlogPage from '../../components/Blog/BlogPage'

export const getStaticProps: GetStaticProps = async () => {
	let posts = await loadPostsFromGithub()

	posts = posts
		.sort((a, b) => Date.parse(b.postedAt) - Date.parse(a.postedAt))
		.map((a) => {
			if (new Date().getTime() - Date.parse(a.postedAt) < 0) {
				console.log('hiding future post', {
					slug: a.slug,
					postedAt: a.postedAt,
					parsed: Date.parse(a.postedAt),
				})
			}
			return a
		})
		.filter((a) => new Date().getTime() - Date.parse(a.postedAt) >= 0)

	return {
		props: {
			posts,
			tags: VALID_TAGS,
			currentTagSlug: '',
		},

		revalidate: 60 * 60,
	}
}

export default BlogPage
