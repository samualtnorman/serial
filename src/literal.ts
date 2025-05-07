import { assert } from "@samual/lib/assert"
import type { DecoderPlugin, EncoderPlugin, Schema } from "."

const LiteralTag = Symbol(`Literal`)
type LiteralTag = typeof LiteralTag

export type LiteralSchema<T = unknown> = Schema<T> & { tag: LiteralTag, value: unknown }
export const literalSchema = <const T>(value: T) => ({ tag: LiteralTag, value }) as LiteralSchema<T>

const isLiteralSchema = (schema: Schema): schema is LiteralSchema => schema.tag == LiteralTag

export const LiteralEncoderPlugin: EncoderPlugin = {
	tag: LiteralTag,
	encode(value, schema) {
		assert(isLiteralSchema(schema), HERE)

		return Object.is(value, schema.value) ? [] : undefined
	}
}

export const LiteralDecoderPlugin: DecoderPlugin = {
	tag: LiteralTag,
	decode(_data, _index, schema) {
		assert(isLiteralSchema(schema), HERE)

		return schema.value
	}
}

export const NullSchema = literalSchema(null)
export const FalseSchema = literalSchema(false)
export const TrueSchema = literalSchema(true)
