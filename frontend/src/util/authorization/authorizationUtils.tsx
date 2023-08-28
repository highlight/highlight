import { Admin, AdminRole, Maybe } from '@graph/schemas'

const HIGHLIGHT_ADMIN_EMAIL_DOMAINS = [
	'@highlight.run',
	'@highlight.io',
	'@runhighlight.com',
] as const

export const onlyAllowAdminRole = (admin?: Admin, role?: string) =>
	role === AdminRole.Admin

export const onlyAllowHighlightStaff = (admin?: Maybe<Admin>) =>
	import.meta.env.DEV ||
	HIGHLIGHT_ADMIN_EMAIL_DOMAINS.some((d) => admin?.email.includes(d)) ||
	false
