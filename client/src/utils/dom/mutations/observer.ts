import { MaskInputOptions } from '@highlight-run/rrweb/dist/snapshot';
import {
  mutationCallBack,
  blockClass,
} from '@highlight-run/rrweb/dist/types';
import MutationBuffer from './mutation';

export function initMutationObserver(
    cb: mutationCallBack,
    bc: blockClass,
    inlineStylesheet: boolean,
    maskInputOptions: MaskInputOptions,
  ): MutationObserver {
    // see mutation.ts for details
    const mutationBuffer = new MutationBuffer(
      cb,
      bc,
      inlineStylesheet,
      maskInputOptions,
    );
    const observer = new MutationObserver(mutationBuffer.processMutations);
    observer.observe(document, {
      attributes: true,
      attributeOldValue: true,
      characterData: true,
      characterDataOldValue: true,
      childList: true,
      subtree: true,
    });
    return observer;
  }