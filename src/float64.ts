import { DecoderPlugin, EncoderPlugin, Schema } from "./common"
import { makeDecoder } from "./decoder"
import { makeEncoder } from "./encoder"

const Float64Tag = Symbol(`Float64`)

export const Float64Schema = { tag: Float64Tag } as Schema<number>

export const Float64EncoderPlugin: EncoderPlugin = {
	tag: Float64Tag,
	encode(value) {
		if (typeof value == `number`)
			return [ ...new Uint8Array(new Float64Array([ value ]).buffer) ]
	}
}

export const Float64DecoderPlugin: DecoderPlugin = {
	tag: Float64Tag,
	decode: (data, index) =>
		new Float64Array(new Uint8Array(data.slice(index.$, index.$ += 8)).buffer)[0]
}

export const encodeFloat64 = makeEncoder(Float64Schema, [ Float64EncoderPlugin ])
export const decodeFloat64 = makeDecoder(Float64Schema, [ Float64DecoderPlugin ])

if (import.meta.vitest) {
	const { test, expect } = import.meta.vitest

	test(`pi`, () => {
		expect(decodeFloat64(encodeFloat64(Math.PI))).toBe(Math.PI)
	})

	test(`NaN`, () => {
		expect(decodeFloat64(encodeFloat64(NaN))).toBe(NaN)
	})
}
