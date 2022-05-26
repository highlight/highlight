import { isOnPrem } from '@util/onPrem/onPremUtils';
import { GetBaseURL } from '@util/window';

export const getInitSnippet = (projectId: string, withOptions = false) =>
    withOptions
        ? `H.init('${projectId}', {
  environment: 'production',
  enableStrictPrivacy: false,${
      isOnPrem ? '\n  backendUrl: "' + GetBaseURL() + '/public",' : ''
  }
});`
        : `H.init('${projectId}');`;
