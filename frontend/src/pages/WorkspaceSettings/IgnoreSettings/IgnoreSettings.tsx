import React from 'react';

import styles from './FieldsForm.module.scss';
import commonStyles from '../../../Common.module.scss';
import classNames from 'classnames/bind';
import { useMutation, gql, useQuery } from '@apollo/client';
import { useParams } from 'react-router-dom';
import { CircularSpinner } from '../../../components/Spinner/Spinner';
import { Select } from 'antd';

export const IgnoreSettings = () => {
    return <p>HI</p>
}