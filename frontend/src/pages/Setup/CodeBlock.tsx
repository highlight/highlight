import React from "react";

import styles from "./SetupPage.module.css";
import { message } from "antd";
import CopyToClipboard from "react-copy-to-clipboard";

import { FaCopy } from "react-icons/fa";

export const CodeBlock = ({ org_id }: { org_id: number }) => {
	const text = `<script>
  var org_id=${org_id}
var bar=['https://static.highlight.run/index.js?','setAttribute','type','script','text/javascript','src','initialize','head','createElement'];(function(foo,Zab){var Baz=function(Foo){while(--Foo){foo['push'](foo['shift']());}};Baz(++Zab);}(bar,0xb6));var foo=function(zab,baz){zab=zab-0x0;var Zab=bar[zab];return Zab;};var script=document[foo('0x6')](foo('0x1'));script[foo('0x8')](foo('0x3'),foo('0x7')+new Date()['getMilliseconds']()),script[foo('0x8')](foo('0x0'),foo('0x2')),document['getElementsByTagName'](foo('0x5'))[0x0]['appendChild'](script),script['addEventListener']('load',()=>{window['H']=new Highlight(),H[foo('0x4')](org_id);});
  </script>
  `;

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
