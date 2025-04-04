import { ButtonIcon, IconSolidAtSymbol } from '@highlight-run/ui/components'

type Props = {
	commentText: string
	inputRef: React.RefObject<HTMLTextAreaElement | null>
	setCommentText: React.Dispatch<React.SetStateAction<string>>
}

export const CommentMentionButton: React.FC<Props> = ({
	commentText,
	inputRef,
	setCommentText,
}) => {
	return (
		<ButtonIcon
			size="xSmall"
			kind="secondary"
			emphasis="low"
			icon={<IconSolidAtSymbol />}
			onClick={() => {
				const textarea = inputRef.current
				textarea?.focus()

				const cursorIndex = textarea?.selectionStart
				const cIndex = cursorIndex
					? cursorIndex + 1
					: commentText.length + 1
				const newCommentText = `${commentText.slice(
					0,
					cursorIndex,
				)}@${commentText.slice(cursorIndex)}`

				setCommentText(newCommentText)

				setTimeout(() => {
					textarea?.setSelectionRange(cIndex, cIndex)
				}, 0)
			}}
		/>
	)
}
