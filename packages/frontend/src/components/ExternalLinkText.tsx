import { FaExternalLinkAlt } from 'react-icons/fa'

export function ExternalLinkText({ children }: { children: React.ReactNode }) {
	return (
		<span className="text-primary-3 inline-flex items-center gap-1 leading-normal">
			<span>{children}</span>
			<FaExternalLinkAlt size={10} />
		</span>
	)
}
