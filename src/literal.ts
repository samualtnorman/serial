import { assert } from "@samual/lib/assert"
import type { DecoderPlugin, EncoderPlugin, Schema } from "./common"

const LiteralTag = Symbol()
type LiteralTag = typeof LiteralTag
export type LiteralSchema = Schema & { tag: LiteralTag, value: unknown }

export const literalSchema = (value: unknown): LiteralSchema => ({ tag: LiteralTag, value })

const isLiteralSchema = (schema: Schema): schema is LiteralSchema => schema.tag == LiteralTag

export const LiteralEncoderPlugin: EncoderPlugin = {
	tag: LiteralTag,
	encode: (schema, _, value) => {
		assert(isLiteralSchema(schema), HERE)
		
		return Object.is(value, schema.value) ? [] : undefined
	}
}

export const LiteralDecoderPlugin: DecoderPlugin = {
	tag: LiteralTag,
	decode: (schema) => {
		assert(isLiteralSchema(schema), HERE)

		return schema.value
	}
}
