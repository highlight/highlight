import { Popover, Transition } from '@headlessui/react'
import { Typography } from '../Typography/Typography'
import { useState } from 'react'

import { FaChevronDown } from 'react-icons/fa'
import * as Icons from 'react-icons/hi'

import styles from './ResourceDropdown.module.scss'
import classNames from 'classnames'

const FeatureDropdown = ({ isOpen }: { isOpen?: boolean }) => {
  const [isShowing, setIsShowing] = useState(false)

  const otherLinks = [
    {
      title: 'Session Replay',
      icon: <Icons.HiFilm className={styles.copyOnLight} />,
      link: '/session-replay',
      sameTab: true,
    },
    {
      title: 'Error Monitoring',
      icon: <Icons.HiTerminal className={styles.copyOnLight} />,
      link: '/error-monitoring',
      sameTab: true,
    },
    {
      title: 'Logging',
      icon: <Icons.HiLightningBolt className={styles.copyOnLight} />,
      link: '/logging',
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
                <Typography type="copy2">Product</Typography>
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
                  <div className={styles.featureGridContainer}>
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

export default FeatureDropdown
