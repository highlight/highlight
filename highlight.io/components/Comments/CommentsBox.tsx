import { Button, message } from 'antd'
import classNames from 'classnames'
import Image from 'next/image'
import { useState } from 'react'
import { Typography } from '../common/Typography/Typography'
import type { Comment } from './Comments'

const upvoteButton = classNames('bg-[#131032] rounded border-2 border-[#1E2848] p-2')
const section = classNames('col-4 border-2 border-[#1E2848] rounded-xl p-6 my-3')
const input = classNames(
  'p-3 h-12 leading-none bg-transparent outline-none text-copy-on-dark text-[17px] rounded-xl bg-[#72E4FC0F] border-2 border-[#72E4FC1C]',
)

export const CommentsBox = function ({
  comments,
  onUpvote,
  onSubmit,
}: {
  comments: Comment[]
  onUpvote: (id: string) => void
  onSubmit: (c: { email: string; name: string; body: string }) => void
}) {
  const [name, setName] = useState<string>()
  const [email, setEmail] = useState<string>()
  const [body, setBody] = useState<string>()

  const numComments = comments.length
  return (
    <div className="w-full flex justify-center">
      <div className="grid-flow-row w-[810px]">
        <div className={section}>
          <div className="w-full flex justify-between">
            <Typography type="copy1">Comments ({numComments})</Typography>
          </div>
        </div>
        {numComments ? (
          <div className={section}>
            <div className="w-full flex flex-col gap-4">
              {comments.map((c) => (
                <div key={c.id} className="flex w-full gap-4">
                  {c.image && (
                    <Image className="rounded-full h-8 w-8" alt={'profile pic'} src={c.image} width={32} height={32} />
                  )}
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-col">
                      <Typography type="copy4" emphasis>
                        {c.name}
                      </Typography>
                      <Typography type="copy4" className="text-[#FFFFFF8F]">
                        {c.email}
                      </Typography>
                    </div>
                    <Typography type="copy2">{c.text}</Typography>
                    <div className="flex flex-row gap-2">
                      <button className={upvoteButton} onClick={() => onUpvote(c.id)}>
                        👍 <Typography type="copy4">{c.vote}</Typography>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
        <div className={section}>
          <div className="w-full flex flex-col gap-5">
            <div className="grid grid-cols-2 gap-5">
              <div className="flex flex-col gap-1">
                <Typography type="copy4" className="text-[#FFFFFF8F]">
                  Name
                </Typography>
                <input
                  type="text"
                  placeholder={`Brian`}
                  value={name}
                  onChange={(ev) => setName(ev.currentTarget.value)}
                  className={input}
                />
              </div>
              <div className="flex flex-col gap-1">
                <Typography type="copy4" className="text-[#FFFFFF8F]">
                  Email
                </Typography>
                <input
                  type="email"
                  placeholder={`brian@example.com`}
                  value={email}
                  onChange={(ev) => setEmail(ev.currentTarget.value)}
                  className={input}
                />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <Typography type="copy4" className="text-[#FFFFFF8F]">
                Your Message
              </Typography>
              <input
                type="text"
                placeholder={`hello there...`}
                value={body}
                onChange={(ev) => setBody(ev.currentTarget.value)}
                className={input}
              />
            </div>
            <div className="flex w-full gap-4">
              <Button
                className="bg-blue-cta text-black px-3 py-1 rounded-lg"
                size={'small'}
                onClick={() => {
                  if (!email || !name || !body) {
                    message.warn('Please fill out the name, email, and comment body.', 5)
                    return
                  }
                  onSubmit({
                    email,
                    name,
                    body,
                  })
                }}
              >
                <Typography type="copy3" emphasis={true}>
                  New Comment
                </Typography>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
