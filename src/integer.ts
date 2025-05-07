import type { DecoderPlugin, EncoderPlugin, Schema } from "./common"
import { makeDecoder } from "./decoder"
import { makeEncoder } from "./encoder"

const Uint8Tag = Symbol(`Uint8`)

export const Uint8Schema = { tag: Uint8Tag } as Schema<number>

export const Uint8EncoderPlugin: EncoderPlugin = {
	tag: Uint8Tag,
	encode(value) {
		if (typeof value == `number` && value >= 0 && value <= 255)
			return [ value ]
	}
}

export const Uint8DecoderPlugin: DecoderPlugin = { tag: Uint8Tag, decode: (data, index) => data[index.$++] }

const Int54Tag = Symbol(`Int54`)

export const Int54Schema = { tag: Int54Tag } as Schema<number>

export const Int54EncoderPlugin: EncoderPlugin = {
	tag: Int54Tag,
	encode(value) {
		if (typeof value == `number` && Number.isInteger(value) && value >= Number.MIN_SAFE_INTEGER && value <= Number.MAX_SAFE_INTEGER)
			return [ ...new Uint8Array(new BigInt64Array([ BigInt(value) ]).buffer).slice(0, -1) ]
	}
}

export const Int54DecoderPlugin: DecoderPlugin = {
	tag: Int54Tag,
	decode(data, index) {
		const slice = data.slice(index.$, index.$ += 7)

		return Number(new BigInt64Array(new Uint8Array([ ...slice, slice[6]! & 0b1000_0000 ? 255 : 0 ]).buffer)[0])
	}
}

export const encodeInt54 = makeEncoder(Int54Schema, [ Int54EncoderPlugin ])
export const decodeInt54 = makeDecoder(Int54Schema, [ Int54DecoderPlugin ])

if (import.meta.vitest) {
	const { test, expect } = import.meta.vitest

	test(`0`, () => expect(decodeInt54(encodeInt54(0))).toBe(0))
	test(`5706099053547292`, () => expect(decodeInt54(encodeInt54(5706099053547292))).toBe(5706099053547292))
	test(`-3121907212409934`, () => expect(decodeInt54(encodeInt54(-3121907212409934))).toBe(-3121907212409934))
}
