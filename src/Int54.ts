import type { DecoderPlugin, EncoderPlugin, Schema } from "./common"
import { makeDecoder } from "./decoder"
import { makeEncoder } from "./encoder"

const Int54Tag = Symbol(`Int54`)

export const Int54Schema = { tag: Int54Tag } as Schema<number>

export const Int54EncoderPlugin: EncoderPlugin = {
	tag: Int54Tag,
	encode(_schema, _callPlugin, value) {
		if (typeof value == `number` && Number.isInteger(value) && value >= Number.MIN_SAFE_INTEGER && value <= Number.MAX_SAFE_INTEGER)
			return [ ...new Uint8Array(new BigInt64Array([ BigInt(value) ]).buffer).slice(0, -1) ]
	}
}

export const Int54DecoderPlugin: DecoderPlugin = {
	tag: Int54Tag,
	decode(_schema, _callPlugin, data, index) {
		const slice = data.slice(index.$, index.$ += 7)

		return Number(new BigInt64Array(new Uint8Array([ ...slice, slice[6]! & 0b1000_0000 ? 255 : 0 ]).buffer)[0])
	}
}

export const encodeInt54 = makeEncoder(Int54Schema, [ Int54EncoderPlugin ])
export const decodeInt54 = makeDecoder(Int54Schema, [ Int54DecoderPlugin ])
