import React, {
    useEffect,
    useState,
    FunctionComponent,
    useContext,
} from 'react';

import { CodeBlock } from './CodeBlock/CodeBlock';
import { IntegrationDetector } from './IntegrationDetector/IntegrationDetector';
import { useParams } from 'react-router-dom';
import styles from './SetupPage.module.scss';
import useFetch from 'use-http';
import { Skeleton } from 'antd';
import { ReactComponent as DownIcon } from '../../static/chevron-down.svg';
import { RadioGroup } from '../../components/RadioGroup/RadioGroup';
import { SidebarContext } from '../../components/Sidebar/SidebarContext';
import { gql, useQuery } from '@apollo/client';
import Collapsible from 'react-collapsible';

enum PlatformType {
    Html = "HTML",
    React = "React",
    Vue = "Vue.js",
    NextJs = "Next.js",
}

export const SetupPage = ({ integrated }: { integrated: boolean }) => {
    const [platform, setPlatform] = useState(PlatformType.React);
    const { setOpenSidebar } = useContext(SidebarContext);
    const { organization_id } = useParams<{ organization_id: string }>();
    const { data, loading } = useQuery<
        { organization: { verbose_id: string } },
        { id: number }
    >(
        gql`
            query GetOrganization($id: ID!) {
                organization(id: $id) {
                    id
                    verbose_id
                }
            }
        `,
        { variables: { id: Number(organization_id) } }
    );

    useEffect(() => {
        setOpenSidebar(true);
    }, [setOpenSidebar]);

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
                <RadioGroup<PlatformType>
                    selectedLabel={platform}
                    labels={[PlatformType.React, PlatformType.Vue, PlatformType.Html, PlatformType.NextJs]}
                    onSelect={(p: PlatformType) => setPlatform(p)}
                />
                {
                    !data?.organization || loading ?
                        <Skeleton /> :
                        <>
                            {platform === PlatformType.Html ? (
                                <HtmlInstructions orgVerboseId={data?.organization.verbose_id} />
                            ) : (
                                    <JsAppInstructions orgVerboseId={data?.organization.verbose_id} platform={platform} />
                                )}
                            <Section title="Identifying Users">
                                <div className={styles.snippetSubHeading}>
                                    To tag sessions with user specific identifiers (name,
                                    email, etc.), you can call the
                        <span className={styles.codeBlockBasic}>
                                        {'H.identify(id: string, object: Object)'}
                                    </span>{' '}
                        method in your javascript app. Here's an example:
                    </div>
                                <CodeBlock
                                    onCopy={() =>
                                        window.analytics.track('Copied Code Snippet', {})
                                    }
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
                            <Section title="Verify Installation" integrated={integrated}>
                                <div className={styles.snippetSubHeading}>
                                    Please follow the setup instructions above to install
                                    Highlight. It should take less than a minute for us to
                                    detect installation.
                    </div>
                                <br />
                                <IntegrationDetector
                                    integrated={integrated}
                                    verbose={true}
                                />
                            </Section>
                        </>
                }
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
window.H.init("${orgVerboseId}")
</script>`}
                        />
                    )}
            </div>
        </Section>
    );
};

const JsAppInstructions = ({ platform, orgVerboseId }: { platform: PlatformType, orgVerboseId: string }) => {
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
                    >{`H.init("${orgVerboseId}")`}</span>{' '}
                    as soon as you can in your site's startup process. <br />
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
                </div>
            </Section>
        </>
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
    const trigger = (
        <div className={styles.triggerWrapper}>
            <div className={styles.snippetHeadingTwo}>
                <span style={{ marginRight: 8 }}>{title}</span>
                {!expanded && integrated !== undefined ? (
                    <IntegrationDetector
                        verbose={false}
                        integrated={integrated}
                    />
                ) : (
                        <></>
                    )}
            </div>
            <DownIcon
                className={styles.icon}
                style={{
                    transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                }}
                onClick={() => setExpanded((e) => !e)}
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

{/* <div
className={styles.section}
style={{ cursor: !expanded ? 'pointer' : 'inherit' }}
onClick={() => !expanded && setExpanded(true)}
> */}