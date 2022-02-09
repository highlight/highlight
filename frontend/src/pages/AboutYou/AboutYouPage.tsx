import { useAuthContext } from '@authentication/AuthContext';
import Button from '@components/Button/Button/Button';
import Card, {
    CardForm,
    CardFormActionsContainer,
    CardHeader,
    CardSubHeader,
} from '@components/Card/Card';
import Input from '@components/Input/Input';
import {
    AppLoadingState,
    useAppLoadingContext,
} from '@context/AppLoadingContext';
import { useUpdateAdminAboutYouDetailsMutation } from '@graph/hooks';
import useLocalStorage from '@rehooks/local-storage';
import { message } from 'antd';
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useHistory } from 'react-router';

import styles from './AboutYouPage.module.scss';

const AboutYouPage = () => {
    const { setLoadingState } = useAppLoadingContext();
    const { admin } = useAuthContext();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [role, setRole] = useState('');
    const history = useHistory();
    const [
        updateAdminAboutYourDetails,
        { loading },
    ] = useUpdateAdminAboutYouDetailsMutation();
    const [signUpReferral, setSignUpReferral] = useLocalStorage(
        'HighlightSignUpReferral',
        ''
    );

    useEffect(() => {
        setLoadingState(AppLoadingState.LOADED);
    }, [setLoadingState]);

    useEffect(() => {
        if (admin) {
            const [adminFirstName, adminLastName] = admin.name.split(' ');
            setFirstName(adminFirstName || '');
            setLastName(adminLastName || '');
        }
    }, [admin]);

    const onFormSubmit = async (e: { preventDefault: () => void }) => {
        e.preventDefault();

        try {
            await updateAdminAboutYourDetails({
                variables: {
                    adminDetails: {
                        name: `${firstName} ${lastName}`,
                        user_defined_role: role,
                        referral: signUpReferral,
                    },
                },
            });

            setSignUpReferral('');
            message.success(
                `Nice to meet you ${firstName}, let's get started!`
            );
            history.push('/');
        } catch {
            message.error('Something went wrong, try again?');
        }
    };

    return (
        <>
            <Helmet>
                <title>About You</title>
            </Helmet>
            <Card className={styles.card}>
                <CardHeader>Tell us about yourself!</CardHeader>
                <CardSubHeader>
                    If you don't mind, a few quick questions before we get you
                    Highlighting!
                </CardSubHeader>

                <CardForm onSubmit={onFormSubmit}>
                    <Input
                        placeholder="First Name"
                        name="First Name"
                        value={firstName}
                        onChange={(e) => {
                            setFirstName(e.target.value);
                        }}
                        autoFocus
                    />
                    <Input
                        placeholder="Last Name"
                        name="Last Name"
                        value={lastName}
                        onChange={(e) => {
                            setLastName(e.target.value);
                        }}
                    />
                    <Input
                        placeholder="Role (e.g. CEO, CTO, Engineer, Product Manager)"
                        name="Role"
                        value={role}
                        onChange={(e) => {
                            setRole(e.target.value);
                        }}
                        autoComplete="off"
                    />
                    <CardFormActionsContainer>
                        <Button
                            trackingId="AboutYouPageNext"
                            type="primary"
                            block
                            loading={loading}
                            htmlType="submit"
                            disabled={
                                firstName.length === 0 ||
                                lastName.length === 0 ||
                                role.length === 0
                            }
                        >
                            Let's Go!
                        </Button>
                    </CardFormActionsContainer>
                </CardForm>
            </Card>
        </>
    );
};

export default AboutYouPage;
