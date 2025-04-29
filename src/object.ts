import { isRecord } from "@samual/lib/isRecord"
import type { DecoderPlugin, EncoderPlugin, Schema } from "./common"
import { assert } from "@samual/lib/assert"

const ObjectTag = Symbol()
type ObjectTag = typeof ObjectTag

type Layout = Record<PropertyKey, Schema>

type LayoutToType<TLayout extends Layout> = { [K in keyof TLayout]: TLayout[K] extends Schema<infer T> ? T : never }

export type ObjectSchema<T = unknown> = Schema<T> & { tag: ObjectTag, layout: Layout }
export const objectSchema = <TLayout extends Layout>(layout: TLayout) => ({ tag: ObjectTag, layout }) as any as ObjectSchema<LayoutToType<TLayout>>

const isObjectSchema = (schema: Schema): schema is ObjectSchema => schema.tag == ObjectTag

export const ObjectEncoderPlugin: EncoderPlugin = {
	tag: ObjectTag,
	encode(schema, callPlugin, value) {
		assert(isObjectSchema(schema), HERE)

		if (isRecord(value)) {
			const result: number[] = []

			for (const key of [ ...Object.getOwnPropertyNames(schema.layout), ...Object.getOwnPropertySymbols(schema.layout) ]) {
				const encodedValue = callPlugin(schema.layout[key]!, value[key])

				if (!encodedValue)
					return

				result.push(...encodedValue)
			}

			return result
		}
	}
}

export const ObjectDecoderPlugin: DecoderPlugin = {
	tag: ObjectTag,
	decode(schema, callPlugin) {
		assert(isObjectSchema(schema), HERE)

		const result: Record<PropertyKey, unknown> = {}

		for (const key of [ ...Object.getOwnPropertyNames(schema.layout), ...Object.getOwnPropertySymbols(schema.layout) ])
			result[key] = callPlugin(schema.layout[key]!)

		return result
	}
}
