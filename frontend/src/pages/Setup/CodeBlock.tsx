import React from "react";

import styles from "./SetupPage.module.css";
import { message } from "antd";
import CopyToClipboard from "react-copy-to-clipboard";

import { FaCopy } from "react-icons/fa";

export const CodeBlock = ({ text }: { text: string  }) => {
	return (
		<>
			<div className={styles.codeBlockWrapper}>
				<div className={styles.codeBlock}>
					<div className={styles.copyButton}>
						<CopyToClipboard
							text={text}
							onCopy={() => message.success("Copied Snippet", 5)}
						>
							<div className={styles.copyDiv}>
								<FaCopy
									style={{
										marginRight: 3,
										height: 14,
										width: 14,
										color: "grey"
									}}
								/>
							</div>
						</CopyToClipboard>
					</div>
					{text}
				</div>
			</div>
		</>
	);
};
