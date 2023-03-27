import { createClient } from '@supabase/supabase-js'
import { useCallback, useEffect, useState } from 'react'
import { v4 as uuid } from 'uuid'
import { CommentsBox } from './CommentsBox'

const Channel = 'blog-posts'

const supabase = createClient(
  'https://zegkgkeylxjinmkhvszq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTYzNDYwOTE1MiwiZXhwIjoxOTUwMTg1MTUyfQ.Hk_ghyYR5dVn5ILfdB5iFX5vxQnwIBwegWJcp7TJloE',
  {
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  },
)

export interface Comment {
  id: string
  created_at: Date
  blog_id: string
  name?: string
  email?: string
  text?: string
  vote?: number
  image?: string
}

export const Comments = function ({ slug }: { slug: string }) {
  const [comments, setComments] = useState<Comment[]>([])

  const shouldAddComment = useCallback(
    (comment: Comment): boolean => {
      const seen = new Set<string>()
      comments.forEach((c) => seen.add(c.id))
      return !seen.has(comment.id)
    },
    [comments],
  )

  useEffect(() => {
    supabase
      .channel(Channel)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'comments',
          filter: `blog_id=eq.${slug}`,
        },
        (payload) => {
          const comment = payload.new as Comment
          if (shouldAddComment(comment)) {
            setComments((prev) => [...prev, comment])
          }
        },
      )
      .subscribe()
    return () => {
      supabase.channel(Channel).unsubscribe()
    }
  }, [shouldAddComment, setComments, slug])

  const onComment = async ({ email, name, body }: { email: string; name: string; body: string }) => {
    const unique_id = uuid()
    const comment = {
      id: unique_id,
      blog_id: slug,
      name,
      email,
      vote: 0,
      text: body,
    } as Comment
    if (shouldAddComment(comment)) {
      setComments((prev) => [...prev, comment])
    }
    await supabase.from('comments').insert(comment)
  }

  const onUpvote = async (id: string) => {
    const promises: any[] = []
    const updatedComments: Comment[] = []
    for (const comment of comments) {
      if (comment.id === id) {
        comment.vote = (comment?.vote || 0) + 1
        promises.push(supabase.from('comments').update(comment).eq('id', comment.id))
      }
      updatedComments.push(comment)
    }
    setComments(updatedComments)
    await Promise.all(promises)
  }

  // for populating comments
  useEffect(() => {
    const getComments = async () => {
      return (await supabase.from('comments').select().eq('blog_id', slug)).data as Comment[]
    }
    getComments().then((d) => d && setComments(d))
  }, [setComments, slug])

  return <CommentsBox comments={comments} onSubmit={onComment} onUpvote={onUpvote} />
}
