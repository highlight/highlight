import TextHighlighter from '@components/TextHighlighter/TextHighlighter'
import { Checkbox } from 'antd'
import isEqual from 'lodash/isEqual'
import { useCallback, useEffect, useRef, useState } from 'react'
import { components } from 'react-select'

const FieldMultiselectOption = (props: any) => {
	const {
		label,
		value,
		isSelected,
		selectOption,
		data: { __isNew__: isNew },
		selectProps: { inputValue },
	} = props

	return (
		<div>
			<components.Option {...props}>
				<div
				// className={styles.optionLabelContainer}
				>
					<Checkbox
						// className={styles.optionCheckbox}
						checked={isSelected}
						onChange={() => {
							selectOption({
								label: label,
								value: value,
								data: { fromCheckbox: true },
							})
						}}
					/>

					<OptionLabelName>
						{isNew ? ( // Don't highlight user provided values (e.g. contains/matches input)
							label
						) : (
							<ScrolledTextHighlighter
								searchWords={inputValue.split(' ')}
								textToHighlight={label}
							/>
						)}
					</OptionLabelName>
				</div>
			</components.Option>
		</div>
	)
}
const OptionLabelName: React.FC<React.PropsWithChildren<unknown>> = (props) => {
	const ref = useRef<HTMLDivElement>(null)

	// const [className, setClassName] = useState<string>(styles.shadowContainer)

	const setScrollShadow = (target: any) => {
		const { scrollLeft, offsetWidth, scrollWidth } = target
		const showRightShadow = scrollLeft + offsetWidth < scrollWidth
		const showLeftShadow = scrollLeft > 0
		// setClassName(
		// 	classNames(styles.shadowContainer, {
		// 		[styles.shadowRight]: showRightShadow && !showLeftShadow,
		// 		[styles.shadowLeft]: showLeftShadow && !showRightShadow,
		// 		[styles.shadowBoth]: showLeftShadow && showRightShadow,
		// 	}),
		// )
	}

	useEffect(() => {
		if (!!ref?.current) {
			setScrollShadow(ref.current)
			const onScroll = (ev: any) => {
				setScrollShadow(ev.target)
			}
			ref.current.removeEventListener('scroll', onScroll)
			ref.current.addEventListener('scroll', onScroll, { passive: true })
			return () => window.removeEventListener('scroll', onScroll)
		}
	}, [ref])

	return (
		<div
		// className={styles.shadowParent}
		>
			<div
			// className={className}
			/>
			<div
				// className={styles.optionLabelName}
				ref={ref}
			>
				{props.children}
			</div>
		</div>
	)
}

function useScroll<T extends HTMLElement>(): [() => void, React.RefObject<T>] {
	const ref = useRef<T>(null)
	const doScroll = useCallback(() => {
		ref?.current?.scrollIntoView({ inline: 'center' })
	}, [])

	return [doScroll, ref]
}

const ScrolledTextHighlighter = ({
	searchWords,
	textToHighlight,
}: {
	searchWords: string[]
	textToHighlight: string
}) => {
	const [memoText, setMemoText] = useState<string>(textToHighlight)
	if (!isEqual(memoText, textToHighlight)) {
		setMemoText(textToHighlight)
	}
	const [doScroll, ref] = useScroll()

	useEffect(() => {
		doScroll()
	}, [doScroll, textToHighlight])

	const ScrolledMark = (props: any) => {
		if (props.highlightIndex === 0) {
			// Attach the ref to the first matching instance
			return (
				<mark
					// className={styles.highlighterStyles}
					ref={ref}
				>
					{props.children}
				</mark>
			)
		} else {
			return (
				<mark
				// className={styles.highlighterStyles}
				>
					{props.children}
				</mark>
			)
		}
	}

	return (
		<TextHighlighter
			highlightTag={ScrolledMark}
			searchWords={searchWords}
			textToHighlight={textToHighlight}
		/>
	)
}

export default FieldMultiselectOption
