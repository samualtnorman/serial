import { type DecoderPlugin, type EncoderPlugin, makeDecoder, makeEncoder, type Schema } from "."

const Float32Tag = Symbol(`Float32`)

export const Float32Schema = { tag: Float32Tag } as Schema<number>

export const Float32EncoderPlugin: EncoderPlugin = {
	tag: Float32Tag,
	encode(value) {
		if (typeof value == `number`)
			return [ ...new Uint8Array(new Float32Array([ value ]).buffer) ]
	}
}

export const Float32DecoderPlugin: DecoderPlugin = {
	tag: Float32Tag,
	decode: (data, index) => new Float32Array(new Uint8Array(data.slice(index.$, index.$ += 4)).buffer)[0]
}

export const encodeFloat32 = makeEncoder(Float32Schema, [ Float32EncoderPlugin ])
export const decodeFloat32 = makeDecoder(Float32Schema, [ Float32DecoderPlugin ])

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

	test(`Float32`, () => expect(decodeFloat32(encodeFloat32(0.4687221050262451))).toBe(0.4687221050262451))

	test(`pi`, () => {
		expect(decodeFloat64(encodeFloat64(Math.PI))).toBe(Math.PI)
	})

	test(`NaN`, () => {
		expect(decodeFloat64(encodeFloat64(NaN))).toBe(NaN)
	})
}
