import { DocSearch } from '@docsearch/react'
import classNames from 'classnames'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { AiFillGithub, AiOutlineClose, AiOutlineMenu } from 'react-icons/ai'
import { FaDiscord } from 'react-icons/fa'
import { GithubPopup } from '../../GithubPopup/GithubPopup'
import { PrimaryButton } from '../Buttons/PrimaryButton'
import { HighlightLogo, HighlightLogoWhite } from '../HighlightLogo/HighlightLogo'
import { Typography } from '../Typography/Typography'
import styles from './Navbar.module.scss'
import ResourceDropdown from './ResourceDropdown'

import '@docsearch/css'
import FeatureDropdown from './FeatureDropdown'

const Navbar = ({
  hideFreeTrialText,
  isDocsPage,
  hideBanner,
  fixed,
  title,
}: {
  hideFreeTrialText?: boolean
  isDocsPage?: boolean
  hideBanner?: boolean
  fixed?: boolean
  title?: string
}) => {
  const [scrolled, setScrolled] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [prevY, setPrevY] = useState(0)

  const changeBackground = () => {
    const currentScrollPos = window.pageYOffset
    if (window.scrollY > 60 && prevY < currentScrollPos) {
      setScrolled(true)
    } else if (window.scrollY > 60 && prevY > currentScrollPos) {
      setScrolled(false)
    }
    setPrevY(currentScrollPos)
  }

  useEffect(() => {
    changeBackground()
    window.addEventListener('scroll', changeBackground)
  })

  return (
    <>
      <GithubPopup />
      <div
        className={classNames(styles.container, {
          [styles.hide]: scrolled && !fixed,
          [styles.fixed]: fixed,
        })}
      >
        <header
          className={classNames({
            [styles.mobileHeader]: isOpen,
          })}
        >
          <div
            className={classNames(styles.header, styles.headerInner, {
              [styles.openHeader]: isOpen,
              [styles.headerBorder]: prevY != 0,
            })}
          >
            <div className={classNames(styles.navContainer, styles.headerLeft)}>
              <Link href={'/'} className={styles.urlStyle}>
                {isOpen ? <HighlightLogoWhite /> : <HighlightLogo />}
              </Link>
              <Typography type="copy3" emphasis={true}>
                <p
                  className={classNames(styles.navTitle, {
                    [styles.copyOnDark]: isOpen,
                    [styles.copyOnLight]: !isOpen,
                  })}
                >
                  {title}
                </p>
              </Typography>
              {isDocsPage && (
                <DocSearch
                  placeholder="Search the highlight.io docs"
                  appId="JGT9LI80J2"
                  indexName="highlight"
                  apiKey="ac336720d8f4f996abe3adee603a1c84"
                />
              )}
            </div>
            <div className={styles.navMenu} onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <AiOutlineClose className={styles.copyOnDark} /> : <AiOutlineMenu />}
            </div>

            {isOpen && (
              <div className={styles.mobileMenu}>
                <ul className={classNames(styles.menuList, styles.header)}>
                  <li>
                    <Typography type="copy3" emphasis={true}>
                      <Link href={'/pricing'} className={styles.menuItemLarge}>
                        Pricing
                      </Link>
                    </Typography>
                  </li>
                  <li>
                    <Typography type="copy3" emphasis={true}>
                      <Link href={'/blog'} className={styles.menuItemLarge}>
                        Blog
                      </Link>
                    </Typography>
                  </li>
                  <li>
                    <Typography type="copy3" emphasis={true}>
                      <Link href={'https://careers.highlight.run'} className={styles.menuItemLarge}>
                        Careers
                      </Link>
                    </Typography>
                  </li>
                  <li>
                    <Typography type="copy3" emphasis={true}>
                      <Link href="/docs" className={styles.menuItemLarge}>
                        Docs
                      </Link>
                    </Typography>
                  </li>
                </ul>
                <div className={styles.menuButtons}>
                  <PrimaryButton href="https://app.highlight.io/sign_up">Get Started</PrimaryButton>
                  <Typography type="copy3" emphasis={true}>
                    <a href="https://app.highlight.io/" className={styles.menuItem}>
                      Sign In
                    </a>
                  </Typography>
                </div>
              </div>
            )}
            {!isDocsPage && (
              <div className={classNames(styles.navContainer, styles.header, styles.headerCenter)}>
                <FeatureDropdown isOpen={scrolled && !fixed} />
                <Link href="/pricing" className={styles.headerButton}>
                  <Typography type="copy2">Pricing</Typography>
                </Link>
                <Link href="/blog" className={styles.headerButton}>
                  <Typography type="copy2">Blog</Typography>
                </Link>
                <ResourceDropdown isOpen={scrolled && !fixed} />
              </div>
            )}
            <div className={classNames(styles.navContainer, styles.header, styles.headerRight)}>
              {!isDocsPage && (
                <Link href="/docs" className={classNames(styles.headerButton, styles.headerButtonRight)}>
                  <Typography type="copy2">Docs</Typography>
                </Link>
              )}
              <a href="https://app.highlight.io/" className={styles.headerButton}>
                <Typography type="copy2">Sign in</Typography>
              </a>
              <PrimaryButton href="https://app.highlight.io/sign_up" className={styles.signUpButton}>
                <Typography type="copy2" emphasis={true}>
                  Sign up
                </Typography>
              </PrimaryButton>
              <div className={styles.socialButtonContainer}>
                <Link
                  href="https://github.com/highlight/highlight"
                  target="_blank"
                  rel="noreferrer"
                  className={classNames(styles.socialButtonWrapper, styles.socialButtonWrapperLeft)}
                >
                  <AiFillGithub className={classNames(styles.socialButton)} />
                </Link>
                <div className={styles.socialButtonDivider}></div>
                <Link
                  href="https://discord.gg/yxaXEAqgwN"
                  target="_blank"
                  rel="noreferrer"
                  className={classNames(styles.socialButtonWrapper, styles.socialButtonWrapperRight)}
                >
                  <FaDiscord className={classNames(styles.socialButton)} />
                </Link>
              </div>
            </div>
          </div>
        </header>
      </div>
    </>
  )
}

export default Navbar
