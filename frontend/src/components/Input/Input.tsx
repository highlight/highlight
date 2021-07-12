import { Input as AntDesignInput, InputProps } from 'antd';
import React from 'react';

type Props = InputProps;

const Input = (props: Props) => {
    return <AntDesignInput {...props} />;
};

export default Input;
