import Button from '@components/Button/Button/Button';
import styles from '@components/Pagination/Pagination.module.scss';
import SvgFastForwardIcon from '@icons/FastForwardIcon';
import SvgRewindIcon from '@icons/RewindIcon';
import { Pagination as AntdPagination } from 'antd';
import React from 'react';

export const PAGE_SIZE = 10;
export const STARTING_PAGE = 1;

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
    const changePage = (dir: PageDirection) => {
        if (dir === PageDirection.Forward) {
            if ((page || STARTING_PAGE) < totalPages.current) {
                setPage((p) => (p || STARTING_PAGE) + 1);
            }
        } else if (dir === PageDirection.Backward) {
            if ((page || STARTING_PAGE) > STARTING_PAGE) {
                setPage((p) => (p || STARTING_PAGE) - 1);
            }
        }
    };
    if (!totalPages.current) return null;
    return (
        <>
            <div className={styles.pageButtonsRow}>
                <div className={styles.container}>
                    <AntdPagination
                        showSizeChanger={false}
                        size={'small'}
                        pageSize={PAGE_SIZE}
                        total={PAGE_SIZE * (totalPages.current + 1)}
                        current={page || STARTING_PAGE}
                        onChange={setPage}
                    />
                </div>
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
                        disabled={(page || STARTING_PAGE) >= totalPages.current}
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
