import Button from '@components/Button/Button/Button';
import { useSlackBot } from '@components/Header/components/PersonalNotificationButton/utils/utils';
import LeadAlignLayout from '@components/layout/LeadAlignLayout';
import { useRemoveSlackBotIntegrationToProjectMutation } from '@graph/hooks';
import Integration from '@pages/IntegrationsPage/components/Integration';
import INTEGRATIONS from '@pages/IntegrationsPage/Integrations';
import { Integration as IntegrationType } from '@pages/IntegrationsPage/Integrations';
import { useParams } from '@util/react-router/useParams';
import React, { useMemo } from 'react';
import { Helmet } from 'react-helmet';

import layoutStyles from '../../components/layout/LeadAlignLayout.module.scss';
import styles from './IntegrationsPage.module.scss';

const IntegrationsPage = () => {
    const { project_id } = useParams<{ project_id: string }>();

    const {
        isSlackConnectedToWorkspace,
        loading,
        slackUrl,
        refetch,
    } = useSlackBot({
        type: 'Organization',
        watch: true,
    });

    const [
        removeSlackBotIntegrationToProjectMutation,
    ] = useRemoveSlackBotIntegrationToProjectMutation();

    const integrations = useMemo(() => {
        return INTEGRATIONS.map(
            (inter) =>
                ({
                    ...inter,
                    defaultEnable:
                        inter.key === 'slack' && isSlackConnectedToWorkspace,
                    configurationPage:
                        inter.key === 'slack'
                            ? (setModelOpen, setIntegrationEnabled) => (
                                  <>
                                      <p>
                                          Connect Slack to your Highlight
                                          workspace to setup alerts and tag
                                          teammates in comments
                                      </p>
                                      <footer>
                                          <Button
                                              trackingId={`IntegrationConfigurationCancel-${inter.name}`}
                                              className={styles.modalBtn}
                                              onClick={() => {
                                                  setModelOpen(false);
                                                  setIntegrationEnabled(false);
                                              }}
                                          >
                                              Cancel
                                          </Button>
                                          <Button
                                              trackingId={`IntegrationConfigurationSave-${inter.name}`}
                                              className={styles.modalBtn}
                                              type="primary"
                                              href={slackUrl}
                                          >
                                              Connect Highlight with Slack
                                          </Button>
                                      </footer>
                                  </>
                              )
                            : inter.configurationPage,
                    deleteConfirmationPage:
                        inter.key === 'slack'
                            ? (setModelOpen, setIntegrationEnabled) => (
                                  <>
                                      <p>
                                          Disconnecting your Slack workspace
                                          from Highlight will require you to
                                          reconfigure any alerts you have made!
                                      </p>
                                      <footer>
                                          <Button
                                              trackingId={`IntegrationDisconnectCancel-${inter.name}`}
                                              className={styles.modalBtn}
                                              onClick={() => {
                                                  setModelOpen(false);
                                                  setIntegrationEnabled(true);
                                              }}
                                          >
                                              Cancel
                                          </Button>
                                          <Button
                                              trackingId={`IntegrationDisconnectSave-${inter.name}`}
                                              className={styles.modalBtn}
                                              type="primary"
                                              onClick={() => {
                                                  setModelOpen(false);
                                                  setIntegrationEnabled(false);
                                                  removeSlackBotIntegrationToProjectMutation(
                                                      {
                                                          variables: {
                                                              project_id: project_id,
                                                          },
                                                      }
                                                  ).then(() => refetch());
                                              }}
                                          >
                                              Disconnect Slack
                                          </Button>
                                      </footer>
                                  </>
                              )
                            : inter.deleteConfirmationPage,
                } as IntegrationType)
        );
    }, [
        isSlackConnectedToWorkspace,
        project_id,
        refetch,
        removeSlackBotIntegrationToProjectMutation,
        slackUrl,
    ]);

    return (
        <>
            <Helmet>
                <title>Integrations</title>
            </Helmet>
            <LeadAlignLayout>
                <h2>Integrations</h2>
                <p className={layoutStyles.subTitle}>
                    Supercharge your workflows and connect Highlight with the
                    tools you use everyday.
                </p>
                {!loading && (
                    <div className={styles.integrationsContainer}>
                        {integrations.map((integration) => (
                            <Integration
                                integration={integration}
                                key={integration.key}
                            />
                        ))}
                    </div>
                )}
            </LeadAlignLayout>
        </>
    );
};

export default IntegrationsPage;
