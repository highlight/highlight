// eslint-disable-next-line no-restricted-imports
import { ModalProps, Modal as AntDesignModal } from 'antd';
import React from 'react';
import Close from '../../static/Close';

type Props = Pick<
    ModalProps,
    'width' | 'onCancel' | 'visible' | 'title' | 'style'
>;

const Modal: React.FC<Props> = ({ children, ...props }) => {
    return (
        <AntDesignModal footer={null} {...props} closeIcon={<Close />}>
            {children}
        </AntDesignModal>
    );
};

export default Modal;
