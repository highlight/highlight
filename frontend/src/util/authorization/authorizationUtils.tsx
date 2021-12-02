import { Admin, AdminRole } from '@graph/schemas';

export const onlyAllowAdminRole = (admin?: Admin) =>
    admin?.role === AdminRole.Admin;
