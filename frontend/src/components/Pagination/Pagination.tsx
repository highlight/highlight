import Button from '@components/Button/Button/Button';
import styles from '@components/Pagination/Pagination.module.scss';
import Tooltip from '@components/Tooltip/Tooltip';
import SvgFastForwardIcon from '@icons/FastForwardIcon';
import SvgRewindIcon from '@icons/RewindIcon';
import { Pagination as AntdPagination } from 'antd';
import React from 'react';

export const PAGE_SIZE = 10;
export const STARTING_PAGE = 1;
const OPENSEARCH_MAX_RESULTS = 10000;
const MAX_PAGES = Math.floor(OPENSEARCH_MAX_RESULTS / PAGE_SIZE) - 1;

enum PageDirection {
    Forward,
    Backward,
}

export const Pagination = ({
    page,
    setPage,
    totalPages,
}: {
    page?: number;
    setPage: React.Dispatch<React.SetStateAction<number | undefined>>;
    totalPages: React.MutableRefObject<number>;
}) => {
    const maxPage = Math.min(MAX_PAGES, totalPages.current);
    const changePage = (dir: PageDirection) => {
        if (dir === PageDirection.Forward) {
            if ((page || STARTING_PAGE) < maxPage) {
                setPage((p) => (p || STARTING_PAGE) + 1);
            }
        } else if (dir === PageDirection.Backward) {
            if ((page || STARTING_PAGE) > STARTING_PAGE) {
                setPage((p) => (p || STARTING_PAGE) - 1);
            }
        }
    };
    if (!maxPage) return null;
    return (
        <>
            <div className={styles.pageButtonsRow}>
                <Tooltip
                    mouseEnterDelay={0.3}
                    placement={'top'}
                    align={{ offset: [106, 0] }}
                    title={
                        (page || STARTING_PAGE) >= MAX_PAGES
                            ? 'There are more pages than we can load. Please narrow the search query.'
                            : ''
                    }
                >
                    <div className={styles.container}>
                        <AntdPagination
                            showSizeChanger={false}
                            size={'small'}
                            pageSize={PAGE_SIZE}
                            total={PAGE_SIZE * (maxPage + 1)}
                            current={page || STARTING_PAGE}
                            onChange={setPage}
                        />
                    </div>
                </Tooltip>
                <div className={styles.pageButtonsContainer} hidden>
                    <Button
                        className={styles.btn}
                        disabled={(page || STARTING_PAGE) <= STARTING_PAGE}
                        trackingId={'SessionsFeedPreviousPage'}
                        onClick={() => {
                            changePage(PageDirection.Backward);
                        }}
                    >
                        <SvgRewindIcon />
                    </Button>
                    <Button
                        className={styles.btn}
                        disabled={(page || STARTING_PAGE) >= maxPage}
                        trackingId={'SessionsFeedNextPage'}
                        onClick={() => {
                            changePage(PageDirection.Forward);
                        }}
                    >
                        <SvgFastForwardIcon />
                    </Button>
                </div>
            </div>
        </>
    );
};
