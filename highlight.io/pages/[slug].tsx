import classNames from 'classnames'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { PrimaryButton } from '../components/common/Buttons/PrimaryButton'
import { FooterCallToAction } from '../components/common/CallToAction/FooterCallToAction'
import { OSSCallToAction } from '../components/common/CallToAction/OSSCallToAction'
import Footer from '../components/common/Footer/Footer'
import Navbar from '../components/common/Navbar/Navbar'
import { Section } from '../components/common/Section/Section'
import { Typography } from '../components/common/Typography/Typography'
import { CompaniesReel } from '../components/Home/CompaniesReel/CompaniesReel'
import { CustomerReviewTrack } from '../components/Home/CustomerReviewTrack'
import { GetStaticPaths, GetStaticProps } from 'next'
import homeStyles from '../components/Home/Home.module.scss'
import LandingInfoRow from '../components/Home/LandingInfoRow'
import { MdKeyboardReturn } from 'react-icons/md'
import { iFeature, FEATURES } from '../components/Features/features'
import sessionReplayHero from '../public/images/features/sessionReplayHero.png'
import errorMonitoringHero from '../public/images/features/errorMonitoringHero.png'
import loggingHero from '../public/images/features/loggingHero.png'

import { AnimateFeatureHeroRight, AnimateFeatureHeroXL } from '../components/Animate'

const ShowcasePage = ({ feature }: { feature: iFeature }) => {
  const [imageLoaded, setImageLoaded] = useState(false)

  const subHeader2List = [
    <>
      Debug from a <span className="text-color-selected-light">user&apos;s</span> perspective.
    </>,
    <>
      Uncover the issues <span className="text-color-selected-light">user&apos;s</span> face.
    </>,
    <>
      Search & set alerts <span className="text-color-selected-light">across your logs.</span>
    </>,
  ]

  return (
    <div>
      <Image src={sessionReplayHero} alt="Hero Background" className="hidden" />
      <Image src={errorMonitoringHero} alt="Hero Background" className="hidden" />
      <Image src={loggingHero} alt="Hero Background" className="hidden" />
      <Navbar />
      <div className="hidden md:flex ml-10 my-2">
        <Link href="/">
          <Typography type="copy3" emphasis={true}>
            <div className="flex items-center justify-start gap-2">
              <MdKeyboardReturn className="h-5" /> Explore highlight.io
            </div>
          </Typography>
        </Link>
      </div>
      <main>
        <div className="flex flex-col xl:flex-row justify-between w-screen px-8 mx-auto lg:px-4 lg:py-28 max-w-[1200px] 2xl:max-w-[1400px]">
          <div className="lg:w-1/2 flex justify-center mt-10">
            <div className="flex flex-col max-w-4xl gap-8 text-center lg:text-left">
              <h2 className="text-white">{feature.header}</h2>

              <Typography type="copy1" className="text-copy-on-dark">
                {feature.subheader}
              </Typography>
              <div className="flex flex-col lg:flex-row justify-start gap-4 w-full lg:w-auto">
                <PrimaryButton
                  className={classNames(homeStyles.solidButton, 'min-w-[180px]')}
                  href="https://app.highlight.io/?sign_up=1"
                >
                  <Typography type="copy2" emphasis={true}>
                    Get started
                  </Typography>
                </PrimaryButton>
                <PrimaryButton href={feature.docsLink} className={classNames(homeStyles.hollowButton)}>
                  <Typography type="copy2" emphasis={true}>
                    Read our docs
                  </Typography>
                </PrimaryButton>
              </div>
            </div>
          </div>
          <div className="flex justify-center mt-12 lg:mt-0 ultra:relative">
            <AnimateFeatureHeroRight loaded={imageLoaded}>
              <Image
                className={`hidden lg:flex ultra:hidden right-0 object-contain top-0`}
                src={feature.slantedImage}
                alt="Feature Spotlight"
                onLoadingComplete={() => setImageLoaded(true)}
              />
            </AnimateFeatureHeroRight>
            <AnimateFeatureHeroXL loaded={imageLoaded}>
              <Image
                className={`hidden ultra:flex`}
                src={feature.regularImage}
                alt="Feature Spotlight"
                onLoadingComplete={() => setImageLoaded(true)}
              />
            </AnimateFeatureHeroXL>
            <Image
              className={`lg:hidden right-0 object-contain bottom-0 md:w-[500px]`}
              src={feature.regularImage}
              alt="Feature Spotlight"
              onLoadingComplete={() => setImageLoaded(true)}
            />
          </div>
        </div>
        <div className="w-full mx-auto max-w-screen-2xl mt-24 lg:mt-60">
          <Section className="flex flex-col gap-20">
            <div className="mx-auto max-w-[1100px]">
              <h2 className="self-center text-center">{subHeader2List[feature.header2Selection]}</h2>
              <div className="px-8 max-w-[700px] mx-auto mt-6 text-center">
                <Typography type="copy1" className="text-copy-on-dark text-center">
                  {feature.subheader2}
                </Typography>
              </div>
            </div>
          </Section>
        </div>

        <div className={classNames(homeStyles.infoContainer, '')}>
          {feature.infoRows?.map((row, index) => {
            return (
              <LandingInfoRow
                key={index}
                title={row.header}
                desc={row.subheader}
                link={row.link}
                linkText={row.linkText}
                privacy={row.privacy || false}
                imgSrc={row.imgSrc || ''}
                invert={row.invert}
                code={row.code}
                codeFrom={row.codeFrom}
              />
            )
          })}
        </div>
        <OSSCallToAction />
        <Section>
          <CompaniesReel />
        </Section>
        <Section>
          <div className={homeStyles.anchorFeature}>
            <div className={homeStyles.anchorHead}>
              <Typography type="copy2" onDark>
                Don&apos;t take our word. <Link href="/customers">Read our customer review section →</Link>
              </Typography>
            </div>
          </div>
        </Section>
        <CustomerReviewTrack />
        <FooterCallToAction />
      </main>
      <Footer />
    </div>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: Object.keys(FEATURES).map((k: string) => ({
      params: { slug: k },
    })),
    fallback: 'blocking',
  }
}

//Gets list of products from products.ts
export const getStaticProps: GetStaticProps = async ({ params }) => {
  const slug = params?.slug as string

  // Handle event slugs which don't exist
  if (!FEATURES[slug]) {
    return {
      notFound: true,
    }
  }

  return {
    props: {
      feature: FEATURES[slug],
    },
  }
}

export default ShowcasePage
