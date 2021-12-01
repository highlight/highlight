import Input from '@components/Input/Input';
import { useAppLoadingContext } from '@context/AppLoadingContext';
import { useSubmitRegistrationFormMutation } from '@graph/hooks';
import { useParams } from '@util/react-router/useParams';
import { message } from 'antd';
import classNames from 'classnames';
import { H } from 'highlight.run';
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Redirect } from 'react-router-dom';

import commonStyles from '../../Common.module.scss';
import Button from '../../components/Button/Button/Button';
import { CircularSpinner } from '../../components/Loading/Loading';
import styles from './RegistrationForm.module.scss';

const RegistrationForm = () => {
    const { workspace_id } = useParams<{ workspace_id: string }>();

    const [teamSize, setTeamSize] = useState<string>('');
    const [role, setRole] = useState<string>('');
    const [useCase, setUseCase] = useState<string>('');
    const [heardAbout, setHeardAbout] = useState<string>('');
    const [pun, setPun] = useState<string>('');

    const { setIsLoading } = useAppLoadingContext();

    const [
        submitRegistrationForm,
        { loading, data, error },
    ] = useSubmitRegistrationFormMutation();

    useEffect(() => {
        setIsLoading(false);
    }, [setIsLoading]);

    const [redirect, setRedirect] = useState(false);
    useEffect(() => {
        if (!!data && !error) {
            message.success(`Form submitted, we'll be in touch within 2 days!`);
            setTimeout(() => setRedirect(true), 3000); // Redirect after 3 seconds
        }
    }, [data, error]);

    // Redirect to the default page for the workspace
    if (redirect) {
        return <Redirect to={`/w/${workspace_id}`} />;
    }

    const onSubmit = (e: { preventDefault: () => void }) => {
        e.preventDefault();
        submitRegistrationForm({
            variables: {
                workspace_id: workspace_id,
                team_size: teamSize,
                role: role,
                use_case: useCase,
                heard_about: heardAbout,
                pun: pun,
            },
        }).then(() => {
            H.track('RegistrationFormSubmitted');
        });
    };

    const isValid =
        teamSize.length > 0 &&
        role.length > 0 &&
        useCase.length > 0 &&
        heardAbout.length > 0;

    return (
        <>
            <Helmet>
                <title>Free Highlight!</title>
            </Helmet>
            <div className={styles.box} key={workspace_id}>
                <form onSubmit={onSubmit}>
                    <h2 className={styles.title}>
                        Sign up for 4 months of Free Highlight!
                    </h2>
                    <p className={styles.subTitle}>
                        Looks like you’ve integrated Highlight; congrats! Fill
                        out the form below to get 4 months of free Highlight. If
                        you’re eligible, we’ll be in touch{' '}
                        <strong>within 2 days with confirmation</strong>!{' '}
                    </p>
                    {error && (
                        <div className={commonStyles.errorMessage}>
                            Error submitting form
                        </div>
                    )}
                    <div className={styles.inputWrapper}>
                        <h4 className={styles.inputLabel}>Team Size</h4>
                        <Input
                            className={styles.formInput}
                            placeholder="Pied Piper Inc., McDonalds, etc."
                            name="teamSize"
                            value={teamSize}
                            onChange={(e) => {
                                setTeamSize(e.target.value);
                            }}
                            autoComplete="off"
                            autoFocus
                            required
                        />
                    </div>
                    <div className={styles.inputWrapper}>
                        <h4 className={styles.inputLabel}>Your Role</h4>
                        <Input
                            className={styles.formInput}
                            placeholder="CTO, Hype-man, Company Clown, etc.."
                            name="role"
                            value={role}
                            onChange={(e) => {
                                setRole(e.target.value);
                            }}
                            autoComplete="off"
                            required
                        />
                    </div>
                    <div className={styles.inputWrapper}>
                        <h4 className={styles.inputLabel}>Your Use Case</h4>
                        <Input
                            className={styles.formInput}
                            placeholder="Observing user behavior, debugging sessions, etc."
                            name="useCase"
                            value={useCase}
                            onChange={(e) => {
                                setUseCase(e.target.value);
                            }}
                            autoComplete="off"
                            required
                        />
                    </div>
                    <div className={styles.inputWrapper}>
                        <h4 className={styles.inputLabel}>
                            How did you hear about us?
                        </h4>
                        <Input
                            className={styles.formInput}
                            placeholder="Product Hunt, Postcard, Carrier Pigeon, etc."
                            name="heardAbout"
                            value={heardAbout}
                            onChange={(e) => {
                                setHeardAbout(e.target.value);
                            }}
                            autoComplete="off"
                            required
                        />
                    </div>
                    <div className={styles.inputWrapper}>
                        <h4 className={styles.inputLabel}>
                            What’s your best Highlight pun?
                        </h4>
                        <Input
                            className={styles.formInput}
                            placeholder="..."
                            name="pun"
                            value={pun}
                            onChange={(e) => {
                                setPun(e.target.value);
                            }}
                            autoComplete="off"
                        />
                    </div>
                    <Button
                        trackingId={`SubmitRegistrationForm`}
                        type="primary"
                        className={classNames(styles.button)}
                        block
                        htmlType="submit"
                        disabled={!isValid}
                    >
                        {loading ? (
                            <CircularSpinner
                                style={{
                                    fontSize: 18,
                                    color: 'var(--text-primary-inverted)',
                                }}
                            />
                        ) : (
                            'Get Free Software! 🍭'
                        )}
                    </Button>
                </form>
            </div>
        </>
    );
};

export default RegistrationForm;
