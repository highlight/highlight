import React, { useState, FunctionComponent } from 'react';

import { CodeBlock } from './CodeBlock/CodeBlock';
import { IntegrationDetector } from './IntegrationDetector/IntegrationDetector';
import { useParams } from 'react-router-dom';
import styles from './SetupPage.module.css';
import useFetch from 'use-http';
import { Skeleton } from 'antd';
import { ReactComponent as DownIcon } from '../../static/chevron-down.svg';

enum PlatformType {
    Html,
    React,
    Vue,
    NextJs,
}

export const SetupPage = ({ integrated }: { integrated: boolean }) => {
    const [platform, setPlatform] = useState(PlatformType.React);

    return (
        <div className={styles.setupWrapper}>
            <div className={styles.blankSidebar}></div>
            <div className={styles.setupPage}>
                <div className={styles.headingWrapper}>
                    <div className={styles.snippetHeading}>
                        Your Recording Snippet
                    </div>
                </div>
                <div className={styles.subTitle}>
                    Setup Highlight in your web application!
                </div>
                <RadioGroup
                    platform={platform}
                    onSelect={(p: PlatformType) => setPlatform(p)}
                />
                {platform === PlatformType.Html ? (
                    <HtmlInstructions />
                ) : (
                    <JsAppInstructions platform={platform} />
                )}
                <Section title="Identifying Users">
                    <div className={styles.snippetSubHeading}>
                        To tag sessions with user specific identifiers (name,
                        email, etc.), you can call the
                        <span className={styles.codeBlockBasic}>
                            {'Hx.identify(id: string, object: Object)'}
                        </span>{' '}
                        method in your javascript app. Here's an example:
                    </div>
                    <CodeBlock
                        onCopy={() =>
                            window.analytics.track('Copied Code Snippet', {})
                        }
                        text={
                            platform === PlatformType.NextJs
                                ? `if (typeof window === )H.identify(\n\t"jay@gmail.com", \n\t{id: "ajdf837dj", phone: "867-5309"}\n)
                    `
                                : `H.identify(\n\t"jay@gmail.com", \n\t{id: "ajdf837dj", phone: "867-5309"}\n)`
                        }
                    />
                </Section>
                <Section title="Verify Installation" integrated={integrated}>
                    <div className={styles.snippetSubHeading}>
                        Follow these instructions to install and verify the
                        integration of Highlight into your application.
                    </div>
                    <br />
                    <IntegrationDetector
                        integrated={integrated}
                        verbose={true}
                    />
                </Section>
            </div>
        </div>
    );
};

const HtmlInstructions = () => {
    const { loading, error, data = '' } = useFetch<string>(
        'https://unpkg.com/highlight.run@latest',
        {},
        []
    );
    const codeStr = data.replace(/(\r\n|\n|\r)/gm, '');
    const { organization_id } = useParams();

    return (
        <Section title="Installing the SDK">
            <div className={styles.snippetSubHeading}>
                Copy and paste the{' '}
                <span className={styles.codeBlockBasic}>{'<script/>'}</span>{' '}
                below into the
                <span className={styles.codeBlockBasic}>{'<head/>'}</span> of
                every page you wish to record.
            </div>
            <div>
                {loading || error ? (
                    <Skeleton active />
                ) : (
                    <CodeBlock
                        onCopy={() =>
                            window.analytics.track('Copied Script', {})
                        }
                        text={`<script>
${codeStr}
window.H.init(${organization_id})
</script>`}
                    />
                )}
            </div>
        </Section>
    );
};

const JsAppInstructions = ({ platform }: { platform: PlatformType }) => {
    const { organization_id } = useParams();
    return (
        <>
            <Section title="Installing the SDK">
                <div className={styles.snippetSubHeading}>
                    Install the{' '}
                    <span className={styles.codeBlockBasic}>
                        {'highlight.run'}
                    </span>{' '}
                    package via your javascript package manager.
                    <br />
                    <CodeBlock text={`npm install highlight.run`} />
                    Or with yarn:
                    <CodeBlock text={`yarn add highlight.run`} />
                </div>
            </Section>
            <Section title="Initializing Highlight">
                {platform === PlatformType.NextJs ? (
                    <div className={styles.callout}>
                        <div className={styles.calloutEmoji}>
                            <span role="img" aria-label="light-bulb">
                                💡
                            </span>
                        </div>
                        <div className={styles.calloutInner}>
                            In Next.js, wrap all client side function calls in{' '}
                            <span className={styles.codeBlockBasic}>
                                if (typeof window...
                            </span>
                            to force the logic to be executed client side.
                        </div>
                    </div>
                ) : (
                    <></>
                )}
                <div className={styles.snippetSubHeading}>
                    Initialize the SDK by importing Highlight like so:{' '}
                    <CodeBlock text={`import { H } from 'highlight.run'`} />
                    and then calling{' '}
                    <span
                        className={styles.codeBlockBasic}
                    >{`H.init(${organization_id})`}</span>{' '}
                    as soon as you can in your site's startup process. <br />
                    {platform !== PlatformType.NextJs ? (
                        <CodeBlock
                            text={`H.init(${organization_id}) // ${organization_id} is your ORG_ID`}
                        />
                    ) : (
                        <CodeBlock
                            text={`if (typeof window !== 'undefined') {
    H.init(${organization_id}) // ${organization_id} is your ORG_ID
}`}
                        />
                    )}
                    In{' '}
                    {platform === PlatformType.React
                        ? 'React'
                        : platform === PlatformType.Vue
                        ? 'Vue'
                        : 'Next.js'}
                    , it can be called at the top of your main component's file
                    like this:
                    <br />
                    {platform === PlatformType.React ? (
                        <CodeBlock
                            text={`import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { H } from 'highlight.run'
 
H.init(${organization_id}); // ${organization_id} is your ORG_ID
 
ReactDOM.render(<App />, document.getElementById('root'));`}
                        />
                    ) : platform === PlatformType.Vue ? (
                        <CodeBlock
                            text={`import Vue from 'vue';
import App from './App.vue';
import { H } from 'highlight.run';
 
H.init(${organization_id}); // ${organization_id} is your ORG_ID
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
  H.init(${organization_id}); // ${organization_id} is your ORG_ID
}

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />
}

export default MyApp`}
                        />
                    )}
                </div>
            </Section>
        </>
    );
};

const RadioGroup = ({
    onSelect,
    platform,
}: {
    onSelect: (p: PlatformType) => void;
    platform: PlatformType;
}) => {
    return (
        <div className={styles.radioGroupWrapper}>
            <div
                style={{
                    borderRadius: '8px 0 0 8px',
                    borderRight: 'none',
                    borderColor:
                        platform === PlatformType.React ? '#5629c6' : '#eaeaea',
                    backgroundColor:
                        platform === PlatformType.React ? '#5629c6' : 'white',
                    color: platform === PlatformType.React ? 'white' : 'black',
                }}
                className={styles.platformOption}
                onClick={() => onSelect(PlatformType.React)}
            >
                React
            </div>
            <div
                style={{
                    borderColor:
                        platform === PlatformType.Vue ? '#5629c6' : '#eaeaea',
                    backgroundColor:
                        platform === PlatformType.Vue ? '#5629c6' : 'white',
                    color: platform === PlatformType.Vue ? 'white' : 'black',
                }}
                className={styles.platformOption}
                onClick={() => onSelect(PlatformType.Vue)}
            >
                Vue.js
            </div>
            <div
                style={{
                    borderLeft: 'none',
                    borderColor:
                        platform === PlatformType.Html ? '#5629c6' : '#eaeaea',
                    backgroundColor:
                        platform === PlatformType.Html ? '#5629c6' : 'white',
                    color: platform === PlatformType.Html ? 'white' : 'black',
                }}
                className={styles.platformOption}
                onClick={() => onSelect(PlatformType.Html)}
            >
                HTML
            </div>
            <div
                style={{
                    borderLeft: 'none',
                    borderRadius: '0 8px 8px 0',
                    borderColor:
                        platform === PlatformType.NextJs
                            ? '#5629c6'
                            : '#eaeaea',
                    backgroundColor:
                        platform === PlatformType.NextJs ? '#5629c6' : 'white',
                    color: platform === PlatformType.NextJs ? 'white' : 'black',
                }}
                className={styles.platformOption}
                onClick={() => onSelect(PlatformType.NextJs)}
            >
                Next.js
            </div>
        </div>
    );
};

type SectionProps = {
    title: string;
    integrated?: boolean;
};

export const Section: FunctionComponent<SectionProps> = ({
    children,
    title,
    integrated,
}) => {
    const [expanded, setExpanded] = useState(false);
    return (
        <div
            className={styles.section}
            style={{ cursor: !expanded ? 'pointer' : 'inherit' }}
            onClick={() => !expanded && setExpanded(true)}
        >
            <DownIcon
                className={styles.icon}
                style={{
                    transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                }}
                onClick={() => setExpanded((e) => !e)}
            />
            <div className={styles.snippetHeadingTwo}>
                <span style={{marginRight: 8}}>
                {title}
                </span>
                {!expanded && integrated !== undefined ? (
                    <IntegrationDetector
                        verbose={false}
                        integrated={integrated}
                    />
                ) : (
                    <></>
                )}
            </div>
            {expanded ? (
                <>
                    <div style={{ height: 10 }} />
                    {children}
                </>
            ) : (
                <></>
            )}
        </div>
    );
};
