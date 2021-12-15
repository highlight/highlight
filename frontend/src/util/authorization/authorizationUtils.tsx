import { Admin, AdminRole } from '@graph/schemas';

export const onlyAllowAdminRole = (admin?: Admin) =>
    admin?.role === AdminRole.Admin;

export const onlyAllowHighlightStaff = (admin?: Admin) =>
    admin?.email.includes('@highlight.run') || false;
