import { makeDecoder, makeEncoder, type DecoderPlugin, type EncoderPlugin, type Schema } from "."
import { ensureNotNullish } from "./internal"

const Int8Tag = Symbol(`Int8`)

export const Int8Schema = { tag: Int8Tag } as Schema<number>

export const Int8EncoderPlugin: EncoderPlugin = {
	tag: Int8Tag,
	encode(value) {
		if (typeof value == `number` && value >= -128 && value <= 127)
			return [ new Int8Array([ value ])[0]! ]
	}
}

export const Int8DecoderPlugin: DecoderPlugin = {
	tag: Int8Tag,
	decode: (data, index): number =>
		ensureNotNullish(new Int8Array(new Uint8Array(data.slice(index.$++, index.$)).buffer)[0], HERE)
}

export const encodeInt8 = makeEncoder(Int8Schema, [ Int8EncoderPlugin ])
export const decodeInt8 = makeDecoder(Int8Schema, [ Int8DecoderPlugin ])

if (import.meta.vitest) {
	const { test, expect } = import.meta.vitest

	test(`works`, () => {
		for (const item of [ 0, 127, -128, -46, -76, 70, 49 ])
			expect(decodeInt8(encodeInt8(item))).toBe(item)
	})
}
