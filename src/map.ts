import { assert } from "@samual/lib/assert"
import { makeDecoder, makeEncoder, type DecoderPlugin, type EncoderPlugin, type Schema } from "."
import { ArrayDecoderPlugin, ArrayEncoderPlugin, arraySchema } from "./array"
import { Uint8DecoderPlugin, Uint8EncoderPlugin, Uint8Schema } from "./integer"
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
				return callPlugin(schema.schema, [ ...value.entries() ].map(([ key, value ]) => ({ key, value })))
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

if (import.meta.vitest) {
	const { test, expect } = import.meta.vitest

	test(`map`, () => {
		const Uint8ToUint8MapSchema = mapSchema(Uint8Schema, Uint8Schema)
		const encodeUint8ToUint8Map = makeEncoder(Uint8ToUint8MapSchema, [ MapEncoderPlugin, Uint8EncoderPlugin ])
		const decodeUint8ToUint8Map = makeDecoder(Uint8ToUint8MapSchema, [ MapDecoderPlugin, Uint8DecoderPlugin ])
		const map = new Map([ [ 1, 2 ], [ 3, 4 ], [ 5, 6 ] ])

		expect(decodeUint8ToUint8Map(encodeUint8ToUint8Map(map))).toStrictEqual(map)
	})
}
