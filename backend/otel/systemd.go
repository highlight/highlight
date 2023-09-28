package otel

import "time"

type SystemdKey = string

const UID SystemdKey = "_UID"
const Cursor SystemdKey = "__CURSOR"
const MachineID SystemdKey = "_MACHINE_ID"
const Timestamp SystemdKey = "__MONOTONIC_TIMESTAMP"
const Transport SystemdKey = "_TRANSPORT"
const BootID SystemdKey = "_BOOT_ID"
const PID SystemdKey = "_PID"
const Hostname SystemdKey = "_HOSTNAME"
const GID SystemdKey = "_GID"
const Priority SystemdKey = "PRIORITY"
const Message SystemdKey = "MESSAGE"
const StreamID SystemdKey = "_STREAM_ID"

func extractSystemd(fields *extractedFields, m map[string]any) {
	fields.logBody = m[Message].(string)
	fields.timestamp = m[Timestamp].(time.Time)
	fields.attrs["BootID"] = m[BootID].(string)
	fields.attrs["Cursor"] = m[Cursor].(string)
	fields.attrs["GID"] = m[GID].(string)
	fields.attrs["Hostname"] = m[Hostname].(string)
	fields.attrs["MachineID"] = m[MachineID].(string)
	fields.attrs["PID"] = m[PID].(string)
	fields.attrs["Priority"] = m[Priority].(string)
	fields.attrs["StreamID"] = m[StreamID].(string)
	fields.attrs["Transport"] = m[Transport].(string)
	fields.attrs["UID"] = m[UID].(string)
}
