import React from 'react'
import { Feature } from './FeatureCarousel'
import styles from '../Home.module.scss'
import Image from 'next/image'
import { Typography } from '../../common/Typography/Typography'
import highlightCodeTheme from '../../common/CodeBlock/highlight-code-theme'
import { Code } from 'react-code-blocks'
import Link from 'next/link'
import { useState } from 'react'
import { HiArrowRight } from 'react-icons/hi'
import { AnimateCarouselImage } from '../../Animate'

const codeTheme = {
  ...highlightCodeTheme,
  backgroundColor: `#0D0225`,
}

const CarouselImage = ({ feature }: { feature: Feature }) => {
  const [imageLoaded, setImageLoaded] = useState(false)

  return (
    <div className="hidden sm:flex w-1/2">
      <div className="absolute right-0 top-0 bottom-0">
        <AnimateCarouselImage loaded={imageLoaded}>
          <Image
            className={`${
              feature.right ? 'right-0' : 'left-0'
            } object-contain absolute bottom-0 sm:w-[280px] md:w-[300px] lg:w-[450px] xl:w-[450px]`}
            src={feature.desktopImage}
            alt="Feature Spotlight"
            onLoadingComplete={() => setImageLoaded(true)}
          />
        </AnimateCarouselImage>
      </div>
    </div>
  )
}

const CarouselFeatures = ({ feature }: { feature: Feature }) => {
  const [imageLoaded, setImageLoaded] = useState(false)

  return (
    <div className={`${feature.code ? 'md:w-[60%]' : 'md:w-2/3'} flex flex-col justify-between h-full sm:w-1/2 px-5`}>
      <div className="flex flex-col gap-4 justify-start md:pt-8 text-left">
        <div className="flex flex-col gap-2">
          <h5 className="hidden sm:flex">{feature.title}</h5>
          <h4 className="sm:hidden">{feature.title}</h4>
          <Typography type="copy3" className="text-copy-on-dark md:text-[18px]">
            {feature.description}
          </Typography>
        </div>
        {feature.code ? (
          <div className="border-[1px] rounded-lg border-divider-on-dark mt-3">
            {feature.code.map((line, index) => (
              <div key={index} className="flex flex-col">
                <div className="m-3 whitespace-pre-wrap break-words sm:break-normal">
                  <Code language={'bash'} text={line} theme={codeTheme} wrapLines />
                </div>
                {index != feature.code!.length - 1 && <div className="w-full h-[1px] bg-divider-on-dark" />}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-3 rounded-lg">
            {feature.link && (
              <div className="flex justify-center sm:justify-start mb-4">
                <Link href={`${feature.link}`}>
                  <Typography type="copy3" emphasis={true}>
                    <div className="flex items-center justify-center gap-2">
                      Learn More <HiArrowRight className="h-5" />
                    </div>
                  </Typography>
                </Link>
              </div>
            )}

            {feature.feature1Link ? (
              <a
                href={feature.feature1Link}
                target="_blank"
                rel="noreferrer noopener"
                className={styles.innerCarouselButton}
              >
                {feature.featureImage1}
                <Typography type="copy3" emphasis>
                  {feature.feature1}
                </Typography>
              </a>
            ) : (
              <div className={styles.innerCarouselFeature}>
                {feature.featureImage1}
                <Typography type="copy3" emphasis>
                  {feature.feature1}
                </Typography>
              </div>
            )}

            {feature.feature2Link ? (
              <a
                href={feature.feature2Link}
                target="_blank"
                rel="noreferrer noopener"
                className={styles.innerCarouselButton}
              >
                {feature.featureImage2}
                <Typography type="copy3" emphasis>
                  {feature.feature2}
                </Typography>
              </a>
            ) : (
              <div className={styles.innerCarouselFeature}>
                {feature.featureImage2}
                <Typography type="copy3" emphasis>
                  {feature.feature2}
                </Typography>
              </div>
            )}

            {feature.feature3Link ? (
              <a
                href={feature.feature3Link}
                target="_blank"
                rel="noreferrer noopener"
                className={styles.innerCarouselButton}
              >
                {feature.featureImage3}
                <Typography type="copy3" emphasis>
                  {feature.feature3}
                </Typography>
              </a>
            ) : (
              <div className={styles.innerCarouselFeature}>
                {feature.featureImage3}
                <Typography type="copy3" emphasis>
                  {feature.feature3}
                </Typography>
              </div>
            )}
          </div>
        )}
      </div>
      <div className="flex sm:hidden justify-center w-full mt-4">
        <Image className="object-contain max-h-[200px] " src={feature.mobileImage} alt="Feature Spotlight" />
      </div>
    </div>
  )
}

export const CarouselCard = (props: { feature: Feature; index: number }) => {
  return (
    <div
      key={props.index}
      className="relative flex w-full md:h-[475px] lg:h-[525px] border-x-0 sm:border-y-[1px] md:border-x-[1px] border-divider-on-dark flex-shrink-0 snap-always snap-center xl:rounded-br-lg xl:rounded-bl-lg overflow-y-hidden"
    >
      <div className="mx-5 py-8 overflow-hidden border-[1px] sm:border-none border-divider-on-dark rounded-lg">
        {props.feature.right ? (
          <>
            <CarouselFeatures feature={props.feature} />
            <CarouselImage feature={props.feature} />
          </>
        ) : (
          <>
            <CarouselImage feature={props.feature} />
            <CarouselFeatures feature={props.feature} />
          </>
        )}
      </div>
    </div>
  )
}
