import { assert } from "@samual/lib/assert"
import * as Bleb from "bleb"
import { makeDecoder, makeEncoder, type DecoderPlugin, type EncoderPlugin, type Schema } from "."

const HexStringTag = Symbol(`HexString`)

export const HexStringSchema = { tag: HexStringTag } as Schema<string>

const isHexString = (value: unknown): value is string => typeof value == `string` && /^[\dA-Za-z]*$/.test(value)
const hexToByteArray = (hex: string) => hex.match(/../g)?.map(hex => parseInt(hex, 16)) || []
const bytesToHex = (bytes: number[]) => bytes.map(byte => byte.toString(16).padStart(2, `0`)).join(``)

export const HexStringEncoderPlugin: EncoderPlugin = {
	tag: HexStringTag,
	encode(value) {
		if (isHexString(value))
			return [ ...Bleb.fromNumber(value.length / 2), ...hexToByteArray(value) ]
	}
}

export const HexStringDecoderPlugin: DecoderPlugin = {
	tag: HexStringTag,
	decode(data, index) {
		const length = Bleb.toNumber(data, index)

		return bytesToHex(data.slice(index.$, index.$ += length))
	}
}

export const encodeHexString = makeEncoder(HexStringSchema, [ HexStringEncoderPlugin ])
export const decodeHexString = makeDecoder(HexStringSchema, [ HexStringDecoderPlugin ])

const FixedLengthHexStringTag = Symbol(`FixedLengthHexString`)
type FixedLengthHexStringTag = typeof FixedLengthHexStringTag

export type FixedLengthHexStringSchema = Schema<string> & { tag: FixedLengthHexStringSchema, byteLength: number }

export const fixedLengthHexStringSchema =
	(byteLength: number) => ({ tag: FixedLengthHexStringTag, byteLength }) as FixedLengthHexStringSchema

const isFixedLengthHexStringSchema =
	(schema: Schema): schema is FixedLengthHexStringSchema => schema.tag == FixedLengthHexStringTag

export const FixedLengthHexStringEncoderPlugin: EncoderPlugin = {
	tag: FixedLengthHexStringTag,
	encode(value, schema) {
		assert(isFixedLengthHexStringSchema(schema), HERE)

		if (isHexString(value) && value.length == schema.byteLength * 2)
			return hexToByteArray(value)
	}
}

export const FixedLengthHexStringDecoderPlugin: DecoderPlugin = {
	tag: FixedLengthHexStringTag,
	decode(data, index, schema) {
		assert(isFixedLengthHexStringSchema(schema), HERE)

		return bytesToHex(data.slice(index.$, index.$ += schema.byteLength))
	}
}

if (import.meta.vitest) {
	const { test, expect } = import.meta.vitest

	test(`01418a8aa6a42b85`, () => {
		const hex = `01418a8aa6a42b85`

		expect(decodeHexString(encodeHexString(hex))).toBe(hex)
	})

	test(`empty`, () => {
		const hex = ``

		expect(decodeHexString(encodeHexString(hex))).toBe(hex)
	})

	test(`fixed byte length`, () => {
		const Hex7ByteStringSchema = fixedLengthHexStringSchema(7)
		const encodeHex7String = makeEncoder(Hex7ByteStringSchema, [ FixedLengthHexStringEncoderPlugin ])
		const decodeHex7String = makeDecoder(Hex7ByteStringSchema, [ FixedLengthHexStringDecoderPlugin ])
		const hex = `10bb86ecae7090`

		expect(decodeHex7String(encodeHex7String(hex))).toBe(hex)
	})
}
