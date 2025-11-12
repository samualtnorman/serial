import { assert } from "@samual/lib/assert"
import { encodeHex } from "@std/encoding"
import { makeDecoder, makeEncoder, type DecoderPlugin, type EncoderPlugin, type Schema } from "."

const Uint53Tag = Symbol(`Uint53`)

export const Uint53Schema = { tag: Uint53Tag } as Schema<number>

export const Uint53EncoderPlugin: EncoderPlugin = {
	tag: Uint53Tag,
	encode(value) {
		if (typeof value == `number` && Number.isInteger(value) && value >= 0 && value <= Number.MAX_SAFE_INTEGER) {
			const bytes = new Uint8Array(8)
			const dataView = new DataView(bytes.buffer)

			dataView.setBigUint64(0, BigInt(value))

			return [ ...bytes.slice(1) ]
		}
	}
}

export const Uint53DecoderPlugin: DecoderPlugin = {
	tag: Uint53Tag,
	decode(data, index): number {
		const slice = data.slice(index.$, index.$ += 7)

		assert(slice.length == 7, HERE)
		assert((slice[0]! & 0b1110_0000) == 0, () => `${HERE} ${encodeHex(new Uint8Array(slice))}`)

		const bytes = new Uint8Array([ 0, ...slice ])
		const dataView = new DataView(bytes.buffer)

		return Number(dataView.getBigUint64(0))
	}
}

export const encodeUint53 = makeEncoder(Uint53Schema, [ Uint53EncoderPlugin ])
export const decodeUint53 = makeDecoder(Uint53Schema, [ Uint53DecoderPlugin ])

if (import.meta.vitest) {
	const { test, expect } = import.meta.vitest

	test(`0`, () => {
		const bytes = encodeUint53(0)

		expect(bytes).toMatchInlineSnapshot(`
			[
			  0,
			  0,
			  0,
			  0,
			  0,
			  0,
			  0,
			]
		`)

		expect(decodeUint53(bytes)).toBe(0)
	})
	test(`5706099053547292`, () => {
		const value = 5706099053547292
		const bytes = encodeUint53(value)

		expect(bytes).toMatchInlineSnapshot(`
			[
			  20,
			  69,
			  170,
			  183,
			  35,
			  207,
			  28,
			]
		`)

		expect(decodeUint53(bytes)).toBe(value)
	})

	test(`6232089337118249`, () => {
		const value = 6232089337118249
		const bytes = encodeUint53(value)

		expect(bytes).toMatchInlineSnapshot(`
			[
			  22,
			  36,
			  13,
			  95,
			  37,
			  190,
			  41,
			]
		`)

		expect(decodeUint53(bytes)).toBe(value)
	})
}
