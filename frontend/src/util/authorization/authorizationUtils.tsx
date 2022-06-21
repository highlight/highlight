import { Admin, AdminRole } from '@graph/schemas';

export const HIGHLIGHT_ADMIN_EMAIL_DOMAINS = [
    '@highlight.run',
    '@highlight.io',
    '@runhighlight.com',
] as const;

export const onlyAllowAdminRole = (admin?: Admin) =>
    admin?.role === AdminRole.Admin;

export const onlyAllowHighlightStaff = (admin?: Admin) =>
    HIGHLIGHT_ADMIN_EMAIL_DOMAINS.some((d) => admin?.email.includes(d)) ||
    false;
