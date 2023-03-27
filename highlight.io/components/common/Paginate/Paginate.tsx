import classNames from 'classnames'
import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import styles from './Paginate.module.scss'

interface PaginateProps {
  onPageChange: Dispatch<SetStateAction<number>>
  pageCount: number
  pageRangeDisplayed: number
  currentPage: number
}

const Paginate = ({ onPageChange, pageCount, pageRangeDisplayed, currentPage }: PaginateProps) => {
  const [pageRange, setPageRange] = useState<Array<number>>([])

  useEffect(() => {
    const newPageRange = []
    for (let i = 0; i < pageRangeDisplayed; i++) {
      newPageRange.push(Math.min(Math.max(currentPage - Math.floor(pageRangeDisplayed / 2) + i + 1, 0), pageCount))
    }
    setPageRange(Array.from(new Set(newPageRange)))
  }, [currentPage, pageCount, pageRangeDisplayed])

  return (
    <div className={styles.paginate}>
      {currentPage > 1 && <div className={styles.pageNumber}>{`< Previous`}</div>}
      {pageRange.map((p, i) =>
        p === 0 ? (
          <div key={i}></div>
        ) : (
          <div
            className={classNames(styles.pageNumber, {
              [styles.currentPage]: currentPage === p,
            })}
            key={i}
            onClick={() => {
              onPageChange(p)
            }}
          >
            {p}
          </div>
        ),
      )}
      {currentPage < pageCount && (
        <div
          className={styles.pageNumber}
          onClick={() => {
            onPageChange(currentPage + 1)
          }}
        >{`Next >`}</div>
      )}
    </div>
  )
}

export default Paginate
