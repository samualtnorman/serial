import { assert } from "@samual/lib/assert"
import { ArrayDecoderPlugin, ArrayEncoderPlugin, arraySchema } from "./array"
import type { DecoderPlugin, EncoderPlugin, Schema } from "."
import { ObjectDecoderPlugin, ObjectEncoderPlugin, objectSchema } from "./object"
import { isRecord } from "@samual/lib/isRecord"
import { getKeys } from "./internal"

const RecordTag = Symbol(`Record`)
type RecordTag = typeof RecordTag

export type RecordSchema<T = unknown> = Schema<T> & { tag: RecordTag, schema: Schema<{ key: PropertyKey, value: unknown }[]> }

export const recordSchema = <TKey extends PropertyKey, TValue>(keySchema: Schema<TKey>, valueSchema: Schema<TValue>) =>
	({ tag: RecordTag, schema: arraySchema(objectSchema({ key: keySchema, value: valueSchema })) }) as any as RecordSchema<Record<TKey, TValue>>

const isRecordSchema = (schema: Schema): schema is RecordSchema => schema.tag == RecordTag

export const RecordEncoderPlugin: EncoderPlugin = [
	{
		tag: RecordTag,
		encode(value, schema, callPlugin) {
			assert(isRecordSchema(schema), HERE)

			if (isRecord(value))
				return callPlugin(schema.schema, getKeys(value).map(key => ({ key, value: value[key] })))
		}
	},
	ArrayEncoderPlugin,
	ObjectEncoderPlugin
]

export const RecordDecoderPlugin: DecoderPlugin = [
	{
		tag: RecordTag,
		decode(_data, _index, schema, callPlugin) {
			assert(isRecordSchema(schema), HERE)

			return Object.fromEntries(callPlugin(schema.schema).map(({ key, value }) => [ key, value ]))
		}
	},
	ArrayDecoderPlugin,
	ObjectDecoderPlugin
]
