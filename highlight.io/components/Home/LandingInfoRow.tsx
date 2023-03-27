import Image from 'next/image'
import styles from './Home.module.scss'
import productStyles from '../Products/Products.module.scss'
import classNames from 'classnames'
import { Typography } from '../common/Typography/Typography'
import { PrimaryButton } from '../common/Buttons/PrimaryButton'
import { ObfuscationSlider } from './ObfuscationSlider/ObfuscationSlider'
import { HighlightCodeBlock } from '../Docs/HighlightCodeBlock/HighlightCodeBlock'
import Link from 'next/link'

//Component for the image/text row for the footer of the product page
//invert puts the image on the right side of the text
const LandingInfoRow = ({
  title,
  desc,
  link,
  linkText,
  invert,
  imgSrc,
  privacy,
  code,
  codeFrom,
}: {
  title: string
  desc: string
  link: string
  linkText: string
  invert?: boolean
  imgSrc: string
  privacy?: boolean
  code?: string
  codeFrom?: string
}) => {
  return (
    <div className={styles.landingInfoRow}>
      <div
        className={`${
          invert ? 'lg:hidden' : ''
        } flex justify-center px-5 mt-5 w-full min-h-[280px] sm:min-h-[300px] sm:h-[400px] lg:h-auto lg:w-[570px]`}
      >
        {privacy && (
          <div className="flex flex-col justify-center w-full">
            <ObfuscationSlider />
          </div>
        )}

        {imgSrc && (
          <Image className="object-scale-down sm:object-contain" src={imgSrc} alt="" width={500} height={400} />
        )}

        {code && (
          <div className="flex flex-col justify-center w-full">
            <HighlightCodeBlock language={'js'} text={code} showLineNumbers={false} />
          </div>
        )}
      </div>
      <div className="flex md:hidden w-full h-[1px] bg-divider-on-dark"> </div>
      <div className="flex flex-col justify-between h-full lg:w-1/2 px-5 text-left lg:text-left">
        <div className="mb-8 md:mb-0">
          <h3 className={productStyles.infoTitle}>{title}</h3>
          <Typography type="copy2" onDark>
            <p className="text-color-copy-on-dark md:text-xl">{desc}</p>
          </Typography>
        </div>
        <div className="flex justify-start">
          <PrimaryButton
            href={link}
            className={classNames(productStyles.hollowButton, productStyles.docsButton, 'lg:mt-5')}
          >
            <Typography type="copy2" emphasis={true}>
              {linkText}
            </Typography>
          </PrimaryButton>
        </div>
      </div>
      <div className={`${invert ? 'lg:flex' : ''} hidden justify-center lg:w-[570px]`}>
        {privacy && <ObfuscationSlider />}
        {imgSrc && <Image src={imgSrc} alt="" width={500} height={400} />}
        {code && (
          <div className="flex flex-col justify-center w-full">
            <HighlightCodeBlock language={'js'} text={code} showLineNumbers={false} />
            <Typography type="copy3" className="text-copy-on-dark mx-auto mt-1">
              Above Example in {codeFrom}{' '}
              <Link className="ml-1 font-medium" href="/docs/getting-started/overview">
                Other Frameworks →
              </Link>
            </Typography>
          </div>
        )}
      </div>
    </div>
  )
}

export default LandingInfoRow
