import React, { useState, FunctionComponent } from 'react';

import { CodeBlock } from './CodeBlock/CodeBlock';
import { IntegrationDetector } from './IntegrationDetector/IntegrationDetector';
import { useParams } from 'react-router-dom';
import styles from './SetupPage.module.scss';
import useFetch from 'use-http';
import { ReactComponent as DownIcon } from '../../static/chevron-down.svg';
import { RadioGroup } from '../../components/RadioGroup/RadioGroup';
import Collapsible from 'react-collapsible';
import Skeleton from 'react-loading-skeleton';
import { H } from 'highlight.run';
import { useGetOrganizationQuery } from '../../graph/generated/hooks';
import useLocalStorage from '@rehooks/local-storage';
import SvgSlackLogo from '../../components/icons/SlackLogo';
import SlackIntegration from '../Alerts/SlackIntegration/SlackIntegration';
import classNames from 'classnames';

enum PlatformType {
    Html = 'HTML',
    React = 'React',
    Vue = 'Vue.js',
    NextJs = 'Next.js',
}

export const SetupPage = ({ integrated }: { integrated: boolean }) => {
    const [platform, setPlatform] = useState(PlatformType.React);
    const { organization_id } = useParams<{ organization_id: string }>();
    const { data, loading } = useGetOrganizationQuery({
        variables: { id: organization_id },
    });

    return (
        <div className={styles.setupWrapper}>
            <div className={styles.setupPage}>
                <div className={styles.headingWrapper}>
                    <h2>Your Highlight Snippet</h2>
                </div>
                <p className={styles.subTitle}>
                    Setup Highlight in your web application!
                </p>
                <RadioGroup<PlatformType>
                    style={{ marginTop: 20, marginBottom: 20 }}
                    selectedLabel={platform}
                    labels={[
                        PlatformType.React,
                        PlatformType.Vue,
                        PlatformType.Html,
                        PlatformType.NextJs,
                    ]}
                    onSelect={(p: PlatformType) => setPlatform(p)}
                />
                {!data?.organization || loading ? (
                    <Skeleton
                        height={75}
                        count={3}
                        style={{ borderRadius: 8, marginBottom: 14 }}
                    />
                ) : (
                    <>
                        {platform === PlatformType.Html ? (
                            <HtmlInstructions
                                orgVerboseId={data?.organization?.verbose_id}
                            />
                        ) : (
                            <JsAppInstructions
                                orgVerboseId={data?.organization?.verbose_id}
                                platform={platform}
                            />
                        )}
                        <Section title="Identifying Users">
                            <p>
                                To tag sessions with user specific identifiers
                                (name, email, etc.), you can call the
                                <span
                                    className={classNames(
                                        styles.codeBlockBasic,
                                        styles.codeBlockInlined
                                    )}
                                >
                                    {'H.identify(id: string, object: Object)'}
                                </span>{' '}
                                method in your javascript app. Here's an
                                example:
                            </p>
                            <CodeBlock
                                onCopy={() => {
                                    window.analytics.track(
                                        'Copied Code Snippet',
                                        { copied: 'code snippet' }
                                    );
                                    H.track(
                                        'Copied Code Snippet (Highlight Event)',
                                        { copied: 'code snippet' }
                                    );
                                }}
                                text={
                                    platform === PlatformType.NextJs
                                        ? `if (typeof window !== 'undefined') {
    H.identify(\n\t"jay@gmail.com", \n\t{id: "ajdf837dj", phone: "867-5309"}
    )
}`
                                        : `H.identify(\n\t"jay@gmail.com", \n\t{id: "ajdf837dj", phone: "867-5309"}\n)`
                                }
                            />
                        </Section>
                        <Section
                            title="Verify Installation"
                            headingIcon={
                                integrated && (
                                    <IntegrationDetector
                                        verbose={false}
                                        integrated={integrated}
                                    />
                                )
                            }
                        >
                            <p>
                                Please follow the setup instructions above to
                                install Highlight. It should take less than a
                                minute for us to detect installation.
                            </p>
                            <IntegrationDetector
                                integrated={integrated}
                                verbose={true}
                            />
                        </Section>
                        <Section
                            title="Enable Slack Alerts"
                            headingIcon={
                                data.organization.slack_webhook_channel ? (
                                    <IntegrationDetector
                                        verbose={false}
                                        integrated={integrated}
                                    />
                                ) : (
                                    <SvgSlackLogo height="15" width="15" />
                                )
                            }
                        >
                            <p>
                                Get notified of errors happening in your
                                application.
                            </p>
                            <SlackIntegration
                                redirectPath="setup"
                                integratedChannel={
                                    data.organization.slack_webhook_channel
                                }
                            />
                        </Section>
                    </>
                )}
            </div>
        </div>
    );
};

const HtmlInstructions = ({ orgVerboseId }: { orgVerboseId: string }) => {
    const { loading, error, data = '' } = useFetch<string>(
        'https://unpkg.com/highlight.run@latest',
        {},
        []
    );
    const codeStr = data.replace(/(\r\n|\n|\r)/gm, '');

    return (
        <Section title="Installing the SDK">
            <p>
                Copy and paste the{' '}
                <span className={styles.codeBlockBasic}>{'<script/>'}</span>{' '}
                below into the
                <span className={styles.codeBlockBasic}>{'<head/>'}</span> of
                every page you wish to record.
            </p>
            <div>
                {loading || error ? (
                    <Skeleton />
                ) : (
                    <CodeBlock
                        onCopy={() => {
                            window.analytics.track('Copied Script', {});
                            H.track('Copied Script (Highlight Event)', {
                                copied: 'script',
                            });
                        }}
                        text={`<script>
${codeStr}
window.H.init("${orgVerboseId}")
</script>`}
                    />
                )}
            </div>
        </Section>
    );
};

const JsAppInstructions = ({
    platform,
    orgVerboseId,
}: {
    platform: PlatformType;
    orgVerboseId: string;
}) => {
    return (
        <>
            <Section title="Installing the SDK">
                <p>
                    Install the{' '}
                    <span className={styles.codeBlockBasic}>
                        {'highlight.run'}
                    </span>{' '}
                    package via your javascript package manager.
                </p>
                <CodeBlock text={`npm install highlight.run`} />
                <p>or with Yarn:</p>
                <CodeBlock text={`yarn add highlight.run`} />
            </Section>
            <Section title="Initializing Highlight">
                {platform === PlatformType.NextJs ? (
                    <div className={styles.callout}>
                        <div className={styles.calloutEmoji}>
                            <span role="img" aria-label="light-bulb">
                                💡
                            </span>
                        </div>
                        <p>
                            In Next.js, wrap all client side function calls in{' '}
                            <span className={styles.codeBlockBasic}>
                                if (typeof window...
                            </span>
                            to force the logic to be executed client side.
                        </p>
                    </div>
                ) : (
                    <></>
                )}
                <p>Initialize the SDK by importing Highlight like so: </p>
                <CodeBlock text={`import { H } from 'highlight.run'`} />
                <p>
                    and then calling{' '}
                    <span
                        className={styles.codeBlockBasic}
                    >{`H.init("${orgVerboseId}")`}</span>{' '}
                    as soon as you can in your site's startup process.
                </p>
                <p>
                    {platform !== PlatformType.NextJs ? (
                        <CodeBlock
                            text={`H.init("${orgVerboseId}") // "${orgVerboseId}" is your ORG_ID`}
                        />
                    ) : (
                        <CodeBlock
                            text={`if (typeof window !== 'undefined') {
    H.init("${orgVerboseId}") // "${orgVerboseId}" is your ORG_ID
}`}
                        />
                    )}
                </p>
                <p>
                    In{' '}
                    {platform === PlatformType.React
                        ? 'React'
                        : platform === PlatformType.Vue
                        ? 'Vue'
                        : 'Next.js'}
                    , it can be called at the top of your main component's file
                    like this:
                </p>
                {platform === PlatformType.React ? (
                    <CodeBlock
                        text={`import React from 'react';
import ReactDOM from 'react-dom';
import './index.scss';
import App from './App';
import { H } from 'highlight.run'

H.init("${orgVerboseId}"); // "${orgVerboseId}" is your ORG_ID

ReactDOM.render(<App />, document.getElementById('root'));`}
                    />
                ) : platform === PlatformType.Vue ? (
                    <CodeBlock
                        text={`import Vue from 'vue';
import App from './App.vue';
import { H } from 'highlight.run';

H.init("${orgVerboseId}"); // "${orgVerboseId}" is your ORG_ID
Vue.prototype.$H = H;

new Vue({
  render: h => h(App)
}).$mount('#app');`}
                    />
                ) : (
                    <CodeBlock
                        text={`import '../styles/globals.css'
import { H } from 'highlight.run';

if (typeof window !== 'undefined') {
  H.init("${orgVerboseId}"); // "${orgVerboseId}" is your ORG_ID
}

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />
}

export default MyApp`}
                    />
                )}
            </Section>
        </>
    );
};

type SectionProps = {
    title: string;
    headingIcon?: React.ReactNode;
};

export const Section: FunctionComponent<SectionProps> = ({
    children,
    title,
    headingIcon,
}) => {
    const [expanded, setExpanded] = useLocalStorage<boolean>(
        `setup-page-section-state-${title}`,
        false
    );

    const trigger = (
        <div className={styles.triggerWrapper}>
            <div className={styles.snippetHeadingTwo}>
                <h3 className={styles.title}>{title}</h3>
                {!expanded && headingIcon}
            </div>
            <DownIcon
                className={styles.icon}
                style={{
                    transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                }}
                onClick={() => setExpanded(!expanded)}
            />
        </div>
    );
    return (
        <div className={styles.section}>
            <Collapsible
                open={expanded}
                onOpening={() => setExpanded(true)}
                onClosing={() => setExpanded(false)}
                trigger={trigger}
                transitionTime={150}
                style={{ margin: 10 }}
            >
                {expanded ? (
                    <>
                        <div style={{ height: 10 }} />
                        {children}
                    </>
                ) : (
                    <></>
                )}
            </Collapsible>
        </div>
    );
};
