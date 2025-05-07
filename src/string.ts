import * as Bleb from "bleb"
import type { DecoderPlugin, EncoderPlugin, Schema } from "."
import { makeDecoder } from "./decoder"
import { makeEncoder } from "./encoder"

const StringTag = Symbol(`String`)

export const StringSchema = { tag: StringTag } as Schema<string>

export const StringEncoderPlugin: EncoderPlugin = {
	tag: StringTag,
	encode(value) {
		if (typeof value == `string`) {
			const encoded = new TextEncoder().encode(value)

			return [ ...Bleb.fromNumber(encoded.length), ...encoded ]
		}
	}
}

export const StringDecoderPlugin: DecoderPlugin = {
	tag: StringTag,
	decode: (data, index) => {
		const length = Bleb.toNumber(data, index)

		return new TextDecoder().decode(new Uint8Array(data.slice(index.$, index.$ += length)))
	}
}

export const encodeString = makeEncoder(StringSchema, [ StringEncoderPlugin ])
export const decodeString = makeDecoder(StringSchema, [ StringDecoderPlugin ])

if (import.meta.vitest) {
	const { test, expect } = import.meta.vitest

	test(`hello world`, () => expect(decodeString(encodeString(`hello world`))).toBe(`hello world`))
	test(`empty`, () => expect(decodeString(encodeString(``))).toBe(``))
}
