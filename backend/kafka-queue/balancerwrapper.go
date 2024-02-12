package kafka_queue

import "github.com/segmentio/kafka-go"

type BalancerWrapper struct {
	balancer       kafka.GroupBalancer
	onAssignGroups func()
}

func (b *BalancerWrapper) ProtocolName() string {
	return b.balancer.ProtocolName()
}

func (b *BalancerWrapper) UserData() ([]byte, error) {
	return b.balancer.UserData()
}

func (b *BalancerWrapper) AssignGroups(members []kafka.GroupMember, partitions []kafka.Partition) kafka.GroupMemberAssignments {
	if b.onAssignGroups != nil {
		b.onAssignGroups()
	}
	return b.balancer.AssignGroups(members, partitions)
}
