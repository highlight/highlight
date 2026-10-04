import { Skeleton as AntDesignSkeleton, SkeletonProps } from 'antd'

type Props = SkeletonProps

const Skeleton = (props: Props) => {
	return <AntDesignSkeleton {...props} />
}

export { Skeleton }
