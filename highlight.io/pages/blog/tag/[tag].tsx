import { GetStaticProps } from 'next'
import { loadPostsFromHygraph, loadTagsFromHygraph, Blog } from '../index'

export async function getStaticPaths(): Promise<{
  paths: string[]
  fallback: string
}> {
  const tags = await loadTagsFromHygraph()

  return {
    paths: tags.map((tag) => `/blog/tag/${tag}`),
    fallback: 'blocking',
  }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const postsRequest = loadPostsFromHygraph(params!.tag as string)
  const tagsRequest = loadTagsFromHygraph()
  const [posts, tags] = await Promise.all([postsRequest, tagsRequest])

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
