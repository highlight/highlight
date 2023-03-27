import Image from 'next/legacy/image'
import style from './CustomerQuote.module.scss'
import { Typography } from '../../common/Typography/Typography'
import classNames from 'classnames'

export const CustomerQuote = ({
  content,
  author,
  authorAvatar,
  role,
}: {
  content: string
  author: string
  authorAvatar: string
  role: string
}) => (
  <div className={style.customerQuote}>
    <blockquote>
      <span className={classNames(style.quote, style.leftQuote)}>“</span>
      <Typography type="copy2" emphasis>
        {content}
      </Typography>
      <span className={classNames(style.quote, style.rightQuote)}>”</span>
    </blockquote>
    <div className={style.quoteAuthor}>
      <Image
        className={style.avatar}
        src={authorAvatar}
        alt="Author picture"
        objectFit="cover"
        width={48}
        height={48}
      />
      <Typography type="copy3" emphasis>
        {author},
      </Typography>
      <Typography type="copy3">{role}</Typography>
    </div>
  </div>
)
