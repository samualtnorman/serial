import { assert } from "@samual/lib/assert"
import { ArrayDecoderPlugin, ArrayEncoderPlugin, arraySchema } from "./array"
import type { DecoderPlugin, EncoderPlugin, Schema } from "."
import { ObjectDecoderPlugin, ObjectEncoderPlugin, objectSchema } from "./object"

const MapTag = Symbol(`Map`)
type MapTag = typeof MapTag

export type MapSchema<T = unknown> = Schema<T> & { tag: MapTag, schema: Schema<{ key: PropertyKey, value: unknown }[]> }

export const mapSchema = <TKey, TValue>(keySchema: Schema<TKey>, valueSchema: Schema<TValue>) =>
	({ tag: MapTag, schema: arraySchema(objectSchema({ key: keySchema, value: valueSchema })) }) as any as MapSchema<Map<TKey, TValue>>

const isMapSchema = (schema: Schema): schema is MapSchema => schema.tag == MapTag

export const MapEncoderPlugin: EncoderPlugin = [
	{
		tag: MapTag,
		encode(value, schema, callPlugin) {
			assert(isMapSchema(schema), HERE)

			if (value instanceof Map)
				return callPlugin(schema.schema, [ ...value.entries().map(([ key, value ]) => ({ key, value })) ])
		}
	},
	ArrayEncoderPlugin,
	ObjectEncoderPlugin
]

export const MapDecoderPlugin: DecoderPlugin = [
	{
		tag: MapTag,
		decode(_data, _index, schema, callPlugin) {
			assert(isMapSchema(schema), HERE)

			return new Map(callPlugin(schema.schema).map(({ key, value }) => [ key, value ]))
		}
	},
	ArrayDecoderPlugin,
	ObjectDecoderPlugin
]
