import type { DecoderPlugin, EncoderPlugin } from "."
import { makeDecoder } from "./decoder"
import { makeEncoder } from "./encoder"
import { FalseSchema, LiteralDecoderPlugin, LiteralEncoderPlugin, TrueSchema } from "./literal"
import { UnionDecoderPlugin, UnionEncoderPlugin, unionSchema } from "./union"

export const BooleanSchema = unionSchema([ FalseSchema, TrueSchema ])
export const BooleanEncoderPlugin: EncoderPlugin = [ LiteralEncoderPlugin, UnionEncoderPlugin ]
export const BooleanDecoderPlugin: DecoderPlugin = [ LiteralDecoderPlugin, UnionDecoderPlugin ]

if (import.meta.vitest) {
	const { test, expect } = import.meta.vitest
	const encodeBoolean = makeEncoder(BooleanSchema, [ BooleanEncoderPlugin ])
	const decodeBoolean = makeDecoder(BooleanSchema, [ BooleanDecoderPlugin ])

	test(`false`, () => expect(decodeBoolean(encodeBoolean(false))).toBe(false))
	test(`true`, () => expect(decodeBoolean(encodeBoolean(true))).toBe(true))
}
