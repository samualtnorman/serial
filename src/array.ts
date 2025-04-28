import { assert } from "@samual/lib/assert"
import type { DecoderPlugin, EncoderPlugin, Schema } from "./common"
import * as Bleb from "bleb"

const ArrayTag = Symbol()
type ArrayTag = typeof ArrayTag

export type ArraySchema<T = unknown> = Schema<T[]> & { tag: ArrayTag, schema: Schema<T> }
export const arraySchema = <T>(schema: Schema<T>) => ({ tag: ArrayTag, schema }) as ArraySchema<T>

const isArraySchema = (schema: Schema): schema is ArraySchema => schema.tag == ArrayTag

export const ArrayEncoderPlugin: EncoderPlugin = {
	tag: ArrayTag,
	encode(schema, callPlugin, value) {
		assert(isArraySchema(schema), HERE)

		if (Array.isArray(value)) {
			const result = [ ...Bleb.fromNumber(value.length) ]
			
			for (const item of value) {
				const encoded = callPlugin(schema.schema, item)

				if (!encoded)
					return undefined

				result.push(...encoded)
			}

			return result
		}
	}
}

export const ArrayDecoderPlugin: DecoderPlugin = {
	tag: ArrayTag,
	decode(schema, callPlugin, data, index = { $: 0 }) {
		assert(isArraySchema(schema), HERE)
		
		const length = Bleb.toNumber(data, index)
		const result = Array(length)

		for (let resultIndex = 0; resultIndex < length; resultIndex++)
			result[resultIndex] = callPlugin(schema.schema, data, index)

		return result
	}
}