import { Token } from 'antlr4'

import { Box, Text } from '@/../../packages/ui/components'
import SearchGrammarParser from '@/components/Search/Parser/SearchGrammarParser'

export const SearchToken: React.FC<{
	token: Token
}> = ({ token }) => {
	if (SearchGrammarParser.literalNames[token.type]) {
		return <Special token={token} />
	}

	return <String token={token} />
}

const String: React.FC<{
	token: Token
}> = ({ token }) => {
	return (
		<Box>
			<Text>{token.text}</Text>
		</Box>
	)
}

const Special: React.FC<{
	token: Token
}> = ({ token }) => {
	return (
		<Box>
			<Text>{token.text}</Text>
		</Box>
	)
}
