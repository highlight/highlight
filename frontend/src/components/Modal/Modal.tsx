// eslint-disable-next-line no-restricted-imports
import { Modal as AntDesignModal, ModalProps } from 'antd';
import classNames from 'classnames';
import React from 'react';

import Close from '../../static/Close';
import styles from './Modal.module.scss';

type Props = Pick<
    ModalProps,
    | 'width'
    | 'onCancel'
    | 'visible'
    | 'style'
    | 'forceRender'
    | 'modalRender'
    | 'destroyOnClose'
    | 'centered'
    | 'mask'
    | 'getContainer'
    | 'className'
> & {
    title?: string;
    minimal?: boolean;
    wide?: boolean;
};

const Modal: React.FC<Props> = ({
    children,
    className,
    title,
    minimal,
    ...props
}) => {
    const bodyStyle: React.CSSProperties = minimal
        ? {
              paddingTop: `var(--size-xSmall)`,
              paddingBottom: `var(--size-xSmall)`,
              paddingLeft: `var(--size-xSmall)`,
              paddingRight: `var(--size-xSmall)`,
          }
        : {};

    return (
        <AntDesignModal
            footer={null}
            {...props}
            closeIcon={!minimal ? <Close height="18px" width="18px" /> : null}
            className={classNames(styles.modal, className)}
            closable={!minimal}
            bodyStyle={bodyStyle}
            maskClosable
        >
            {title && <h3 className={styles.title}>{title}</h3>}
            <main className={styles.modalContent}>{children}</main>
        </AntDesignModal>
    );
};

export default Modal;
