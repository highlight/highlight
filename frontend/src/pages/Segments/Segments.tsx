import React from 'react';
import { useParams } from 'react-router-dom';

import styles from './Segments.module.css';
import { useQuery, gql } from '@apollo/client';
import { Spinner } from '../../components/Spinner/Spinner';

export const Segments = () => {
    return <div className={styles.test}>
        <Segment />
    </div>;
}

const Segment = () => {
    const { organization_id } = useParams();
    const { loading, error, data } = useQuery<
        { segments: any[] },
        { organization_id: number }
    >(
        gql`
            query GetSegments(
                $organization_id: ID!
            ) {
                segments(                      
                    organization_id: $organization_id
                ) {
                    name
                    params
                }
            }
        `,
        { variables: { organization_id: organization_id } }
    );

    const params = data?.segments[0].params
    console.log("DATA: " + params)
    console.log("error: " + JSON.stringify(error))
    console.log("loading: " + JSON.stringify(loading))
    return (
        <>
            <div className={styles.test}>
                {JSON.stringify(data)}
            </div>
            <div>
                {loading ? (
                    <div className={styles.loadingDiv}>
                        <Spinner />
                    </div>
                ) : (
                    <></>
                )}
            </div>
        </>
    );
}