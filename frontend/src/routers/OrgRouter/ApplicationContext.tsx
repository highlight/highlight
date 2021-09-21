import { Maybe, Project } from '../../graph/generated/schemas';
import { createContext } from '../../util/context/context';

/**
 * Provides data about the current application and all applications the admin has access to.
 */
interface ApplicationContext {
    currentApplication?: Project;
    allApplications: Maybe<
        Maybe<
            {
                __typename?: 'Project' | undefined;
            } & Pick<Project, 'id' | 'name'>
        >[]
    >;
}

export const [
    useApplicationContext,
    ApplicationContextProvider,
] = createContext<ApplicationContext>('Application');
