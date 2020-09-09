import React from "react";

import styles from "./SetupPage.module.css";
import { CodeBlock } from "./CodeBlock";
import { useParams } from "react-router-dom";

export const SetupPage = () => {
	let { organization_id } = useParams();

	return (
		<div className={styles.setupWrapper}>
			<div className={styles.snippetCard}>
				<div className={styles.snippetHeading}>
					Your Recording Snippet
				</div>
				<div className={styles.snippetSubHeading}>
					Copy and paste the script below into the head of every page
					you wish to record.
				</div>
				<CodeBlock
					text={`<script>
  var org_id=${organization_id}
var bar=['https://static.highlight.run/index.js?','setAttribute','type','script','text/javascript','src','initialize','head','createElement'];(function(foo,Zab){var Baz=function(Foo){while(--Foo){foo['push'](foo['shift']());}};Baz(++Zab);}(bar,0xb6));var foo=function(zab,baz){zab=zab-0x0;var Zab=bar[zab];return Zab;};var script=document[foo('0x6')](foo('0x1'));script[foo('0x8')](foo('0x3'),foo('0x7')+new Date()['getMilliseconds']()),script[foo('0x8')](foo('0x0'),foo('0x2')),document['getElementsByTagName'](foo('0x5'))[0x0]['appendChild'](script),script['addEventListener']('load',()=>{window['H']=new Highlight(),H[foo('0x4')](org_id);});
  </script>
  `}
				/>
			</div>
		</div>
	);
};
