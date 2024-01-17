import { decompressSync, strFromU8 } from 'fflate'

export const decompressPushPayload = (data) => {
	const buff = Uint8Array.from(atob(data), (c) => c.charCodeAt(0))
	return JSON.parse(strFromU8(decompressSync(buff)))
}
