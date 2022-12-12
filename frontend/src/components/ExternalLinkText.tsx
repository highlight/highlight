import { FaExternalLinkAlt } from 'react-icons/fa'

export function ExternalLinkText({ children }: { children: React.ReactNode }) {
	return (
		<span className="inline-flex items-center gap-1 leading-normal text-primary-3">
			<span>{children}</span>
			<FaExternalLinkAlt size={10} />
		</span>
	)
}
