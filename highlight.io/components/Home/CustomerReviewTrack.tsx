import React, { useCallback, useEffect, useRef, useState } from 'react'
import { CustomerReview } from '../../pages'
import styles from './Home.module.scss'
import { REVIEWS } from './Reviews'

export const CustomerReviewTrack = () => {
  const scrollYPosition = useRef<number>(0)
  const [scrollReviews, setScrollReviews] = useState(false)

  const reviewsRef = useRef<HTMLDivElement>(null)

  const scrollListener = useCallback(() => {
    if (!scrollReviews) {
      return
    }

    if (reviewsRef.current) {
      const { scrollY } = window
      const scrollingDown = scrollYPosition.current > scrollY
      // Adjust this value to control scroll speed
      const scrollDistance = scrollingDown ? -3 : 3
      reviewsRef.current.scrollLeft += scrollDistance
      scrollYPosition.current = scrollY
    }
  }, [scrollReviews])

  useEffect(() => {
    window.removeEventListener('scroll', scrollListener)
    window.addEventListener('scroll', scrollListener)
    return () => window.removeEventListener('scroll', scrollListener)
  }, [scrollListener])

  useEffect(() => {
    const reviewsElement = reviewsRef.current

    const observer = new IntersectionObserver(
      ([entry]) => {
        setScrollReviews(entry.isIntersecting)
      },
      {
        root: null,
        rootMargin: '250px 0px',
        threshold: 0,
      },
    )

    if (reviewsElement) {
      observer.observe(reviewsElement)

      // Scroll to center on load
      reviewsElement.scrollLeft = (reviewsElement.scrollWidth - window.innerWidth) / 2
    }

    return () => {
      if (reviewsElement) {
        observer.unobserve(reviewsElement)
      }
    }
  }, [reviewsRef])

  return (
    <div className={styles.slider} ref={reviewsRef}>
      <div className={styles.slideTrack}>
        {[...REVIEWS, ...REVIEWS].map((review, i) => (
          <CustomerReview
            key={i}
            companyLogo={review.companyLogo}
            text={review.text}
            author={review.author}
            scale={review.scale}
          />
        ))}
      </div>
    </div>
  )
}
