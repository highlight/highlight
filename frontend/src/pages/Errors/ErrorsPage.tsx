import React from 'react';
import {useState, useEffect} from 'react';
import { useParams } from 'react-router-dom';
import { gql, useQuery } from '@apollo/client';
import {Button} from 'antd';
import styles from './ErrorsPage.module.scss';


export const ErrorsPage = () => {
    const { organization_id } = useParams<{ organization_id: string }>();
    const { data } = useQuery<
        { errors: [] },
        { organization_id: number }
    >(
        gql`
        query Errors(
            $organization_id: ID!
        ) {
            errors(
                organization_id: $organization_id
            )
        }
    `, {variables: {organization_id: parseInt(organization_id)}, pollInterval: 5000});

    const throwError = () : void => {
        throw new Error("This error is from a throw");
    }

    const consoleError = (): void => {
        console.error("This error was from the console")
    }

    return (
        <div>
            <div className={styles.advancedText}>
                <Button type="primary" onClick={throwError}>Throw Error</Button>
                <Button type="primary" onClick={consoleError}>Console Error</Button>
            </div>
            <div className={styles.errorText}> 
                {JSON.stringify(data)}
            </div>
        </div>
    )
    
}