export const isProjectWithinTrial = (project: any) => {
    if (project?.trial_end_date) {
        return new Date(project.trial_end_date) >= new Date();
    }
    return false;
};
