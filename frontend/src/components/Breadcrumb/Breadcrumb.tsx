import SvgChevronRightIcon from '@icons/ChevronRightIcon';
import { Breadcrumb as AntDesignBreadcrumb } from 'antd';
import classNames from 'classnames';
import React from 'react';
import { useLocation } from 'react-router';
import { Link } from 'react-router-dom';

import styles from './Breadcrumb.module.scss';

interface Props {
    getBreadcrumbName: (currentUrl: string) => string;
    linkRenderAs?: 'h2' | 'span';
}

const Breadcrumb = ({ getBreadcrumbName, linkRenderAs = 'span' }: Props) => {
    const location = useLocation();

    const pathSnippets = location.pathname.split('/').filter((i) => i);
    const breadcrumbItems = pathSnippets.map((_, index) => {
        const url = `/${pathSnippets.slice(0, index + 1).join('/')}`;

        // Ignore the first route nesting. To to to prevent users from going to routes like https://app.highlight.run/50. These routes don't do anything/are invalid.
        if (index === 0) {
            return null;
        }
        return (
            <AntDesignBreadcrumb.Item key={url}>
                <Link
                    to={url}
                    className={classNames({
                        [styles.disabled]: index === pathSnippets.length - 1,
                    })}
                >
                    {linkRenderAs === 'h2' ? (
                        <h2 className={styles.h2}>{getBreadcrumbName(url)}</h2>
                    ) : (
                        linkRenderAs === 'span' && (
                            <span>{getBreadcrumbName(url)}</span>
                        )
                    )}
                </Link>
            </AntDesignBreadcrumb.Item>
        );
    });

    return (
        <div>
            <AntDesignBreadcrumb
                separator={<SvgChevronRightIcon className={styles.icon} />}
                className={styles.breadcrumb}
            >
                {breadcrumbItems}
            </AntDesignBreadcrumb>
        </div>
    );
};

export default Breadcrumb;
