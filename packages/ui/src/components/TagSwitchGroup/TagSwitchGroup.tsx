import { Box } from '../Box/Box'

import * as styles from './styles.css'

type Props = React.PropsWithChildren & styles.Variants & {}

export const TagSwitchGroup: React.FC<Props> = ({ children, ...props }) => {
	return <Box cssClass={styles.variants({ ...props })}>{children}</Box>
}
