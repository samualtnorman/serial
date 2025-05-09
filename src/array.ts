import { assert } from "@samual/lib/assert"
import * as Bleb from "bleb"
import type { DecoderPlugin, EncoderPlugin, Schema } from "."

const ArrayTag = Symbol(`Array`)
type ArrayTag = typeof ArrayTag

export type ArraySchema<T = unknown> = Schema<T[]> & { tag: ArrayTag, schema: Schema<T> }
export const arraySchema = <T>(schema: Schema<T>) => ({ tag: ArrayTag, schema }) as ArraySchema<T>

const isArraySchema = (schema: Schema): schema is ArraySchema => schema.tag == ArrayTag

export const ArrayEncoderPlugin: EncoderPlugin = {
	tag: ArrayTag,
	encode(value, schema, callPlugin) {
		assert(isArraySchema(schema), HERE)

		if (Array.isArray(value)) {
			const result = [ ...Bleb.fromNumber(value.length) ]

			for (const item of value) {
				const encoded = callPlugin(schema.schema, item)

				if (!encoded)
					return

				result.push(...encoded)
			}

			return result
		}
	}
}

export const ArrayDecoderPlugin: DecoderPlugin = {
	tag: ArrayTag,
	decode(data, index, schema, callPlugin) {
		assert(isArraySchema(schema), HERE)

		const length = Bleb.toNumber(data, index)
		const result = Array(length)

		for (let resultIndex = 0; resultIndex < length; resultIndex++)
			result[resultIndex] = callPlugin(schema.schema)

		return result
	}
}
