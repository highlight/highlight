import React from "react";

import styles from "./SetupPage.module.css";
import { CodeBlock } from "./CodeBlock";
import { useParams } from "react-router-dom";

export const SetupPage = () => {
  let { organization_id } = useParams();

  return (
    <div className={styles.setupWrapper}>
      <div className={styles.snippetCard}>
        <div className={styles.snippetHeading}>Your Recording Snippet</div>
        <div className={styles.snippetSubHeading}>
          Copy and paste the{" "}
          <span className={styles.codeBlockBasic}>{"<script/>"}</span> below
          into the
          <span className={styles.codeBlockBasic}>{"<head/>"}</span> of every
          page you wish to record.
        </div>
        <CodeBlock
          text={`<script>
window['_h_debug'] = false;
window['_h_script'] = 'https://static.highlight.run';
window['_h_org'] = ${organization_id};
var a=['script'];(function(b,e){var f=function(g){while(--g){b['push'](b['shift']());}};f(++e);}(a,0x72));var b=function(c,d){c=c-0x0;var e=a[c];return e;};var script=document['createElement'](b('0x0'));script['setAttribute']('src',window['_h_script']+'/index.js?'+new Date()['getMilliseconds']()),script['setAttribute']('type','text/javascript'),document['getElementsByTagName']('head')[0x0]['appendChild'](script),script['addEventListener']('load',()=>{window['highlight_obj']=new Highlight(window['_h_debug']),highlight_obj['initialize'](window['_h_org']);}),window['H']={},window['H']['Identify']=c=>{var d=setInterval(function(){window['highlight_obj']&&window['highlight_obj']['ready']&&(clearInterval(d),window['highlight_obj']['identify'](c));},0xc8);};
</script>`}
        />
        <div className={styles.snippetSubHeading}>
          To tag every session with the current user's identifier (name, email,
          etc.) run the following code in your javascript app or in a subsequent
          <span className={styles.codeBlockBasic}>{"<script/>"}</span> tag.
        </div>
        <CodeBlock text={`window.H.identify(<identifier>)`} />
      </div>
    </div>
  );
};
