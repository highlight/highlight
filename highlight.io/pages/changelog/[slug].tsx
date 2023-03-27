import Image from 'next/legacy/image'
import BlueGradient from '../../public/images/bg_blue_gradient.svg'
import PurpleGradient from '../../public/images/bg_purple_gradient.svg'
import homeStyles from '../../components/Home/Home.module.scss'
import styles from '../../components/Blog/Blog.module.scss'
import Navbar from '../../components/common/Navbar/Navbar'
import { Section } from '../../components/common/Section/Section'
import Footer from '../../components/common/Footer/Footer'
import { gql } from 'graphql-request'
import classNames from 'classnames'
import { GetStaticPaths, GetStaticProps } from 'next/types'
import { FooterCallToAction } from '../../components/common/CallToAction/FooterCallToAction'
import ReactMarkdown from 'react-markdown'
import { Meta } from '../../components/common/Head/Meta'
import { GraphQLRequest } from '../../utils/graphql'

export const getStaticPaths: GetStaticPaths = async () => {
  const QUERY = gql`
    {
      changelogs {
        slug
      }
    }
  `
  const { changelogs } = await GraphQLRequest(QUERY)

  return {
    paths: changelogs.map((p: { slug: string }) => ({
      params: { slug: p.slug },
    })),
    fallback: 'blocking',
  }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const slug = params?.slug as string

  const QUERY = gql`
    query GetChangelog($slug: String!) {
      changelog(where: { slug: $slug }) {
        title
        createdAt
        content
      }
    }
  `
  const data = await GraphQLRequest(QUERY, { slug: slug })

  // Handle event slugs which don't exist in our CMS
  if (!data.changelog) {
    return {
      notFound: true,
    }
  }

  return {
    props: {
      changelog: data.changelog,
    },
    revalidate: 60 * 60, // Cache response for 1 hour (60 seconds * 60 minutes)
  }
}

const ChangelogPage = ({ changelog }: { changelog: any }) => {
  return (
    <>
      <Meta title={changelog.title} description={changelog.title} />
      <div className={homeStyles.bgPosition}>
        <div className={homeStyles.purpleDiv}>
          <Image src={PurpleGradient} alt="" />
        </div>
        <div className={homeStyles.blueDiv}>
          <Image src={BlueGradient} alt="" />
        </div>
      </div>
      <Navbar />
      <main>
        <Section>
          <div className={homeStyles.anchorTitle}>
            <h1>{changelog.title}</h1>
            <div className={styles.authorDiv}>
              <div>
                <p>{`${new Date(changelog.createdAt).toLocaleDateString('en-US')}`}</p>
              </div>
            </div>
          </div>
        </Section>
        <Section>
          <div className={classNames(homeStyles.anchorTitle, styles.postBody)}>
            <ReactMarkdown>{changelog.content}</ReactMarkdown>
          </div>
        </Section>
        <FooterCallToAction />
      </main>
      <Footer />
    </>
  )
}

export default ChangelogPage
