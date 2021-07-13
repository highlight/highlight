export const isOrganizationWithinTrial = (organization: any) => {
    if (organization?.trial_end_date) {
        return new Date(organization.trial_end_date) >= new Date();
    }
    return false;
};
