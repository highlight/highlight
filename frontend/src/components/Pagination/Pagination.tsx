import Button from '@components/Button/Button/Button';
import styles from '@components/Pagination/Pagination.module.scss';
import SvgFastForwardIcon from '@icons/FastForwardIcon';
import SvgRewindIcon from '@icons/RewindIcon';
import { Pagination as AntdPagination } from 'antd';
import React from 'react';

export const PAGE_SIZE = 10;

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
            if ((page || 0) < totalPages.current) {
                setPage((p) => (p || 0) + 1);
            }
        } else if (dir === PageDirection.Backward) {
            if ((page || 0) > 0) {
                setPage((p) => (p || 0) - 1);
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
                        current={(page || 0) + 1}
                        onChange={(p) => setPage(p - 1)}
                    />
                </div>
                <div className={styles.pageButtonsContainer}>
                    <Button
                        className={styles.btn}
                        disabled={(page || 0) <= 0}
                        trackingId={'SessionsFeedPreviousPage'}
                        onClick={() => {
                            changePage(PageDirection.Backward);
                        }}
                    >
                        <SvgRewindIcon />
                    </Button>
                    <Button
                        className={styles.btn}
                        disabled={(page || 0) >= totalPages.current}
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
