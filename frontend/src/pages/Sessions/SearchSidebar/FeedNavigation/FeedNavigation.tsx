import React from 'react';
import {
    RouteComponentProps,
    useLocation,
    useParams,
    withRouter,
} from 'react-router-dom';
import { RadioGroup } from '../../../../components/RadioGroup/RadioGroup';

const FeedNavigationButtons: React.FunctionComponent<RouteComponentProps> = ({
    history,
}) => {
    const { organization_id } = useParams<{
        organization_id: string;
    }>();
    const { pathname } = useLocation();
    const page = pathname.split('/')[2] ?? '';

    return (
        <RadioGroup<string>
            selectedLabel={page.charAt(0).toUpperCase() + page.slice(1)}
            style={{ marginBottom: 20 }}
            labels={['Sessions', 'Errors']}
            onSelect={(p: string) =>
                history.push(`/${organization_id}/${p.toLowerCase()}`)
            }
        />
    );
};

export const FeedNavigation = withRouter(FeedNavigationButtons);
