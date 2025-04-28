import { assert, ensure } from "@samual/lib/assert"
import * as Bleb from "bleb"
import type { DecoderPlugin, EncoderPlugin, Schema } from "./common"

const UnionTag = Symbol()
type UnionTag = typeof UnionTag

export type UnionSchema<T = unknown> = Schema<T> & { tag: UnionTag, schemas: Schema[] }
export const unionSchema = <T>(schemas: Schema<T>[]) => ({ tag: UnionTag, schemas }) as UnionSchema<T>

const isUnionSchema = (schema: Schema): schema is UnionSchema => schema.tag == UnionTag

export const UnionEncoderPlugin: EncoderPlugin = {
	tag: UnionTag,
	encode(schema, callPlugin, value) {
		assert(isUnionSchema(schema), HERE)

		for (const [ index, subschema ] of schema.schemas.entries()) {
			const encoded = callPlugin(subschema, value)

			if (encoded)
				return [ ...Bleb.fromNumber(index), ...encoded ]
		}
	}
}

export const UnionDecoderPlugin: DecoderPlugin = {
	tag: UnionTag,
	decode(schema, callPlugin, data, index) {
		assert(isUnionSchema(schema), HERE)

		return callPlugin(ensure(schema.schemas[Bleb.toNumber(data, index)], HERE))
	}
}
