import { Maybe, Organization } from '../../graph/generated/schemas';
import { createContext } from '../../util/context/context';

/**
 * Provides data about the current application and all applications the admin has access to.
 */
interface ApplicationContext {
    currentApplication?: Organization;
    allApplications: Maybe<
        Maybe<
            {
                __typename?: 'Organization' | undefined;
            } & Pick<Organization, 'id' | 'name'>
        >[]
    >;
}

export const [
    useApplicationContext,
    ApplicationContextProvider,
] = createContext<ApplicationContext>('Application');
