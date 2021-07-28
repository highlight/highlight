import { message } from 'antd';
import React from 'react';
import { useForm } from 'react-hook-form';

import commonStyles from '../../Common.module.scss';
import Button from '../../components/Button/Button/Button';
import { CircularSpinner } from '../../components/Loading/Loading';
import { useSendEmailSignupMutation } from '../../graph/generated/hooks';
import styles from './RequestAccess.module.scss';

type Inputs = {
    email: string;
};

export const RequestAccessPage = () => {
    const { register, handleSubmit, errors } = useForm<Inputs>();
    const [sendEmailSignup, { loading }] = useSendEmailSignupMutation();

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
                <h2 className={styles.title}>We're in private beta!</h2>
                <p className={styles.subTitle}>
                    Wanna use Highlight? Request access below and we'll reach
                    out!
                </p>
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
                <Button
                    trackingId="RequestAccess"
                    className={commonStyles.submitButton}
                    type="primary"
                    htmlType="submit"
                >
                    {loading ? (
                        <CircularSpinner
                            style={{
                                fontSize: 18,
                                color: 'var(--text-primary-inverted)',
                            }}
                        />
                    ) : (
                        'Request Access'
                    )}
                </Button>
            </form>
        </div>
    );
};
