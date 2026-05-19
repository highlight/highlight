declare module '*.svg' {
	const content: React.FunctionComponent<React.SVGProps<SVGSVGElement>> | string;
	export default content;
}

declare module '*.png' {
	const content: string;
	export default content;
}

declare module '*.jpg' {
	const content: string;
	export default content;
}

declare module '*.jpeg' {
	const content: string;
	export default content;
}

declare module '*.gif' {
	const content: string;
	export default content;
}
