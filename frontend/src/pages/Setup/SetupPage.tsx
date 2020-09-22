import React from "react";

import { CodeBlock } from "./CodeBlock";
import { Spinner } from "../../components/Spinner/Spinner";
import { useParams } from "react-router-dom";

import styles from "./SetupPage.module.css";
import appStyles from "../../App.module.css";
import useFetch from "use-http";

export const SetupPage = () => {
	const { loading, error, data = "" } = useFetch<string>(
		process.env.REACT_APP_BUNDLE_URI + "/firstload.js",
		{},
		[]
	);
	const { organization_id } = useParams();

	if (loading || error) {
		return (
			<div className={appStyles.loadingWrapper}>
				<Spinner />
			</div>
		);
	}

	const codeStr = data.replace(/(\r\n|\n|\r)/gm, "");

	return (
		<div className={styles.setupWrapper}>
			<div className={styles.snippetCard}>
				<div className={styles.snippetHeading}>
					Your Recording Snippet
				</div>
				<div className={styles.snippetSubHeading}>
					Copy and paste the{" "}
					<span className={styles.codeBlockBasic}>{"<script/>"}</span>{" "}
					below into the
					<span className={styles.codeBlockBasic}>
						{"<head/>"}
					</span>{" "}
					of every page you wish to record.
				</div>
				<CodeBlock
					text={`<script>
window['_h_debug'] = false;
window['_h_script'] = 'https://static.highlight.run';
window['_h_org'] = ${organization_id};
${codeStr}
</script>`}
				/>
				<div className={styles.snippetSubHeading}>
					To tag every session with a user identifier (name, email,
					etc.), run the following code in your javascript app or in a
					subsequent
					<span className={styles.codeBlockBasic}>
						{"<script/>"}
					</span>{" "}
					tag.
				</div>
				<CodeBlock text={`window.H.identify("<YOUR_IDENTIFIER>")`} />
			</div>
		</div>
	);
};
