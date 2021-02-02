import React from 'react';
import { useParams } from 'react-router-dom';
import { gql, useQuery } from '@apollo/client';
import { ErrorMessage } from '../../util/shared-types';
import { Button } from 'antd';
import styles from './ErrorsPage.module.scss';

export const ErrorsPage = () => {
    const { organization_id } = useParams<{ organization_id: string }>();
    const { data } = useQuery<
        { errors: ErrorMessage[] },
        { organization_id: number }
    >(
        gql`
            query Errors($organization_id: ID!) {
                errors(organization_id: $organization_id) {
                    event
                    type
                    source
                    line_no
                    column_no
                    trace
                }
            }
        `,
        {
            variables: { organization_id: parseInt(organization_id) },
            pollInterval: 5000,
        }
    );

    const throwError = (): void => {
        throw new Error('This error is from a throw');
    };

    const consoleError = (): void => {
        console.error('This error was from the console');
    };

    return (
        <div>
            <div className={styles.advancedText}>
                <Button type="primary" onClick={throwError}>
                    Throw Error
                </Button>
                <Button type="primary" onClick={consoleError}>
                    Console Error
                </Button>
            </div>
            <div className={styles.errorText}>
                {data?.errors.map((u) => {
                    return <p>{JSON.stringify(u)}</p>;
                })}
            </div>
        </div>
    );
};
