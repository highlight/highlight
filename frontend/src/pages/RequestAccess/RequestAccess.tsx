import React from 'react';
import { useForm } from 'react-hook-form';
import { CircularSpinner } from '../../components/Loading/Loading';
import { useSendEmailSignupMutation } from '../../graph/generated/hooks';

import styles from './RequestAccess.module.scss';
import commonStyles from '../../Common.module.scss';
import { message } from 'antd';

type Inputs = {
    email: string;
};

export const RequestAccessPage = () => {
    const { register, handleSubmit, errors } = useForm<Inputs>();
    const [sendEmailSignup, { loading }] = useSendEmailSignupMutation({
        context: { headers: { 'Highlight-Demo': true } },
    });

    const onSubmit = async (data: Inputs) => {
        try {
            await sendEmailSignup({ variables: { email: data.email } });
            await message.success(
                "Thanks for requesting access! We'll be in touch!",
                5
            );
        } catch (e) {
            await message.error(
                'Error requesting access, message us on intercom instead?',
                5
            );
        }
    };

    return (
        <div className={styles.box}>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className={styles.title}>We're in private beta!</div>
                <div className={styles.subTitle}>
                    Request access below and we'll reach out. We appreciate the
                    interest!
                </div>
                <input
                    placeholder={'Work Email'}
                    name="email"
                    type="email"
                    ref={register({ required: true })}
                    className={commonStyles.input}
                />
                <div className={commonStyles.errorMessage}>
                    {errors.email && 'Error with email ' + errors.email.message}
                </div>
                <button className={commonStyles.submitButton} type="submit">
                    {loading ? (
                        <CircularSpinner
                            style={{ fontSize: 18, color: 'white' }}
                        />
                    ) : (
                        'Request Access'
                    )}
                </button>
            </form>
        </div>
    );
};
