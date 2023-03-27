import { AiFillGithub } from 'react-icons/ai'
import { Popover, Transition } from '@headlessui/react'
import { Typography } from '../Typography/Typography'
import { useState } from 'react'

import { FaChevronDown } from 'react-icons/fa'
import * as Icons from 'react-icons/hi'

import styles from './ResourceDropdown.module.scss'
import classNames from 'classnames'

const ResourceDropdown = ({ isOpen }: { isOpen?: boolean }) => {
  const [isShowing, setIsShowing] = useState(false)

  const otherLinks = [
    {
      title: 'Status Page',
      icon: <Icons.HiCloud className={styles.copyOnLight} />,
      link: 'https://highlight.hyperping.io/',
    },
    {
      title: 'Community',
      icon: <Icons.HiUsers className={styles.copyOnLight} />,
      link: 'https://discord.gg/yxaXEAqgwN',
    },
    {
      title: 'Changelog',
      icon: <Icons.HiClipboardList className={styles.copyOnLight} />,
      link: 'https://www.highlight.io/docs/general/changelog/overview',
    },
    {
      title: 'Feedback',
      icon: <Icons.HiChat className={styles.copyOnLight} />,
      link: 'https://feedback.highlight.run',
    },
    {
      title: 'Github',
      icon: <AiFillGithub className={styles.copyOnLight} />,
      link: 'https://github.com/highlight/highlight',
    },
    {
      title: 'Blog',
      icon: <Icons.HiCollection className={styles.copyOnLight} />,
      link: '/blog',
      sameTab: true,
    },
    {
      title: 'Documentation',
      icon: <Icons.HiDocumentSearch className={styles.copyOnLight} />,
      link: '/docs',
      sameTab: true,
    },
  ]

  return (
    <Popover>
      {({ open }) => (
        <>
          <Popover.Button
            onMouseEnter={() => setIsShowing(true)}
            onMouseLeave={() => setIsShowing(false)}
            className={styles.popoverButton}
          >
            <a
              className={classNames(styles.headerButton, {
                [styles.white]: isShowing,
              })}
            >
              <div className="flex gap-[6.5px] items-center">
                <Typography type="copy2">Resources</Typography>
                <FaChevronDown className="w-[10px]" />
              </div>
            </a>
          </Popover.Button>
          <Transition
            show={isShowing}
            onMouseEnter={() => setIsShowing(true)}
            onMouseLeave={() => setIsShowing(false)}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-1"
          >
            {!isOpen && (
              <Popover.Panel className={styles.popover}>
                <div className={styles.popoverPanel}>
                  <div className={styles.gridContainer}>
                    {otherLinks.map((item, index) => (
                      <a
                        key={index}
                        href={item.link}
                        target={item.sameTab ? '' : '_blank'}
                        rel="noreferrer"
                        className={styles.gridItem}
                      >
                        {item.icon}
                        <Typography type="copy3">{item.title}</Typography>
                      </a>
                    ))}
                  </div>
                </div>
              </Popover.Panel>
            )}
          </Transition>
        </>
      )}
    </Popover>
  )
}

export default ResourceDropdown
