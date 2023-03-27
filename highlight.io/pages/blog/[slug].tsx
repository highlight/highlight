import classNames from 'classnames'
import { gql } from 'graphql-request'
import Image from 'next/legacy/image'
import { GetStaticPaths, GetStaticProps } from 'next/types'
import YouTube from 'react-youtube'
import styles from '../../components/Blog/Blog.module.scss'
import { FooterCallToAction } from '../../components/common/CallToAction/FooterCallToAction'
import Footer from '../../components/common/Footer/Footer'
import { Section } from '../../components/common/Section/Section'
import homeStyles from '../../components/Home/Home.module.scss'

import { RichText } from '@graphcms/rich-text-react-renderer'
import { ElementNode } from '@graphcms/rich-text-types'
import { createElement, useEffect, useRef, useState } from 'react'
import { PostAuthor } from '../../components/Blog/Author'
import BlogNavbar from '../../components/Blog/BlogNavbar/BlogNavbar'
import { Post } from '../../components/Blog/BlogPost/BlogPost'
import { SuggestedBlogPost } from '../../components/Blog/SuggestedBlogPost/SuggestedBlogPost'
import { PostTag } from '../../components/Blog/Tag'
import { Comments } from '../../components/Comments/Comments'
import { BlogCallToAction } from '../../components/common/CallToAction/BlogCallToAction'
import { Meta } from '../../components/common/Head/Meta'
import { Typography } from '../../components/common/Typography/Typography'
import { HighlightCodeBlock } from '../../components/Docs/HighlightCodeBlock/HighlightCodeBlock'
import { GraphQLRequest } from '../../utils/graphql'

const NUM_SUGGESTED_POSTS = 3

interface Content {
  text?: string
  href?: string
  type?: string
  children?: Content[]
  openInNewTab?: boolean
  code?: boolean
  italic?: boolean
  bold?: boolean
}

const getBlogTypographyRenderer = (type: string) => {
  function ParagraphBody({ content }: { content: Content }) {
    if (content.text) {
      if (content.code) {
        return <span className={styles.codeInline}>{content.text}</span>
      } else if (content.italic) {
        return <i>{content.text}</i>
      } else if (content.bold) {
        return <b>{content.text}</b>
      } else if (content.text.indexOf('://') !== -1) {
        return (
          <>
            {content.text.split('/').map((p) => (
              <>
                {p}
                {'/'}
                <wbr />
              </>
            ))}
          </>
        )
      }
      return <>{content.text}</>
    } else if (content.href) {
      return (
        <a href={content.href} {...(content.openInNewTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
          {content?.children?.map((c, idx) => (
            <ParagraphBody content={c} key={`child-${idx}`} />
          ))}
        </a>
      )
    }
    return null
  }

  function ParagraphHeader({ children }: { children: any }) {
    return (
      <>
        {createElement(
          type,
          {
            className: styles.blogText,
          },
          children?.props?.content.map((c: Content, idx: number) => <ParagraphBody content={c} key={idx} />),
        )}
      </>
    )
  }

  return ParagraphHeader
}

export const getStaticPaths: GetStaticPaths = async () => {
  const QUERY = gql`
    {
      posts {
        slug
      }
    }
  `
  const { posts } = await GraphQLRequest(QUERY)

  return {
    paths: posts.map((p: { slug: string }) => ({ params: { slug: p.slug } })),
    fallback: 'blocking',
  }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const slug = params?.slug as string

  const QUERY = gql`
    query GetPost($slug: String!) {
      post(where: { slug: $slug }) {
        slug
        title
        metaTitle
        youtubeVideoId
        image {
          url
        }
        description
        metaDescription
        publishedAt
        publishedBy {
          name
          picture
        }
        richcontent {
          raw
          markdown
        }
        tags
        tags_relations {
          name
          slug
        }
        readingTime
        author {
          firstName
          lastName
          title
          twitterLink
          linkedInLink
          githubLink
          personalWebsiteLink
          profilePhoto {
            url
          }
        }
      }
    }
  `
  const POSTS_QUERY = gql`
      query GetPosts() {
          posts(
              orderBy: publishedAt_DESC
              where: { unlisted: false }
          ) {
              slug
              title
              image {
                  url
              }
              richcontent {
                  markdown
              }
              publishedAt
              tags
              tags_relations {
                name
                slug
              }
              readingTime
          }
      }
  `
  const data = await GraphQLRequest(QUERY, { slug: slug })
  const { posts } = await GraphQLRequest(POSTS_QUERY)

  // Handle event slugs which don't exist in our CMS
  if (!data.post) {
    return {
      notFound: true,
    }
  }

  const otherPosts = posts.filter((post: any) => post.slug !== slug)
  const suggestedPosts = []
  // suggest N random posts that are not the current post
  for (let i = 0; i < Math.min(NUM_SUGGESTED_POSTS, posts.length - 1); i++) {
    suggestedPosts.push(otherPosts.splice(Math.floor(Math.random() * otherPosts.length), 1)[0])
  }

  const postSections: PostSection[] = []
  let currentBlock: ElementNode[] = []
  for (const r of data.post.richcontent.raw.children) {
    let specialType: SectionType | undefined = undefined
    for (const child of r.children) {
      // update here to support other tags
      if (child.text === SectionType.CallToAction) {
        specialType = SectionType.CallToAction
        break
      }
    }
    switch (specialType) {
      // update here to support other tags
      case SectionType.CallToAction:
        postSections.push({
          nodes: currentBlock,
          footer: 'BlogCallToAction',
        })
        currentBlock = []
        break
      default:
        r.className = '.testing'
        currentBlock.push(r)
    }
  }
  if (currentBlock.length) {
    postSections.push({
      nodes: currentBlock,
      footer: null,
    })
  }

  if (!data.post.author?.profilePhoto?.url) {
    throw new Error(
      `missing required profile image for blog '${data.post.slug}', author: ${data.post.author?.profilePhoto?.url}.`,
    )
  }

  return {
    props: {
      suggestedPosts,
      post: data.post,
      postSections,
    },
    revalidate: 60 * 60, // Cache response for 1 hour (60 seconds * 60 minutes)
  }
}

interface PostSection {
  nodes: ElementNode[]
  footer: string | null
}

// update here to support other tags
enum SectionType {
  CallToAction = '{{CALL_TO_ACTION}}',
}

const PostSection = ({ p }: { p: PostSection; idx: number }) => {
  return (
    <>
      <RichText
        content={{
          children: p.nodes,
        }}
        renderers={{
          code_block: ({ children }: { children: any }) => {
            return (
              <HighlightCodeBlock language={'js'} text={children?.props?.content[0].text} showLineNumbers={false} />
            )
          },
          h1: getBlogTypographyRenderer('h1'),
          h2: getBlogTypographyRenderer('h2'),
          h3: getBlogTypographyRenderer('h3'),
          h4: getBlogTypographyRenderer('h4'),
          h5: getBlogTypographyRenderer('h5'),
          h6: getBlogTypographyRenderer('h6'),
          p: getBlogTypographyRenderer('p'),
          img: (props) => (
            <div className={styles.blogImageContainer}>
              <Image
                className={styles.blogImage}
                src={props.src || ''}
                alt={props.altText}
                width={props.width}
                height={props.height}
              />
            </div>
          ),
        }}
      />
      {/*update to support new footer components*/}
      {p.footer === 'BlogCallToAction' ? <BlogCallToAction /> : null}
    </>
  )
}

const PostPage = ({
  post,
  postSections,
  suggestedPosts,
}: {
  post: Post
  postSections: PostSection[]
  suggestedPosts: Post[]
}) => {
  const blogBody = useRef<HTMLDivElement>(null)
  const [endPosition, setEndPosition] = useState(0)

  useEffect(() => {
    setEndPosition(blogBody.current?.offsetHeight || 0)
    // recalculate end position when blog sections are processed
    // because at that point the page height is finalized
  }, [postSections])

  const isStartupStack = post.tags_relations.filter((t) => t.name.toLocaleLowerCase().includes('stack')).length > 0

  const singleTag = post.tags_relations.length === 1 ? post.tags_relations[0] : undefined

  return (
    <>
      <Meta
        title={post.metaTitle || post.title}
        description={post.metaDescription || post.description}
        absoluteImageUrl={`https://${process.env.NEXT_PUBLIC_VERCEL_URL}/api/og/blog/${post.slug}`}
        canonical={`/blog/${post.slug}`}
      />
      <BlogNavbar title={post.title} endPosition={endPosition} singleTag={singleTag} />
      <main ref={blogBody} className={classNames(styles.mainBlogPadding, 'relative')}>
        <Section>
          <div className={classNames(homeStyles.anchorTitle, styles.blogSection)}>
            <Typography type="copy2">
              <p className={styles.dateDiv}>{`${new Date(post.publishedAt).toLocaleDateString('en-US', {
                day: 'numeric',
                year: 'numeric',
                month: 'short',
              })} • ${post.readingTime || Math.floor(post.richcontent.markdown.split(' ').length / 200)} min read`}</p>
            </Typography>
            <h1 className={styles.blogText}>{post.title}</h1>
            <div className={classNames(styles.tagDiv, styles.postTagDiv)}>
              {post.tags_relations.map((tag) => (
                <PostTag {...tag} key={tag.slug} />
              ))}
            </div>
            <div className={styles.authorDiv}>{post.author && <PostAuthor {...post.author} />}</div>
          </div>
        </Section>
        {post.image?.url && (
          <Section className={styles.headerSection}>
            {isStartupStack ? (
              <div className={classNames(styles.youtubeEmbed, homeStyles.anchorTitle, styles.blogSection)}>
                <YouTube
                  videoId={post.youtubeVideoId || 'dQw4w9WgXcQ'}
                  style={{ display: 'flex', justifyContent: 'center' }}
                ></YouTube>
              </div>
            ) : (
              <div className={classNames(styles.mainImage, homeStyles.anchorTitle, styles.blogSection)}>
                <Image src={post.image.url || ''} alt="" layout="fill" objectFit="cover" priority />
              </div>
            )}
          </Section>
        )}
        <Section className={styles.headerSection}>
          <div className={classNames(homeStyles.anchorTitle, styles.postBody, styles.postBodyTop, styles.blogSection)}>
            {postSections?.map((p, idx) => (
              <PostSection key={idx} idx={idx} p={p} />
            ))}
          </div>
        </Section>
        <Section>
          <div className={styles.postBodyDivider}></div>
        </Section>
        <Section>
          <Comments slug={post.slug} />
        </Section>
        <Section>
          <div className={classNames(homeStyles.anchorTitle, styles.postBody)}>
            <h3 className={styles.otherArticlesHeader}>Other articles you may like</h3>
            {suggestedPosts.map((p, i) => (
              <SuggestedBlogPost {...p} key={i} />
            ))}
          </div>
        </Section>
      </main>
      <FooterCallToAction />
      <Footer />
    </>
  )
}

export default PostPage
