import { assert, ensure } from "@samual/lib/assert"
import * as Bleb from "bleb"
import type { DecoderPlugin, EncoderPlugin, InferSchemaType, Schema } from "."

const UnionTag = Symbol(`Union`)
type UnionTag = typeof UnionTag

export type UnionSchema<T = unknown> = Schema<T> & { tag: UnionTag, schemas: Schema[] }
export const unionSchema = <TOption extends Schema>(schemas: TOption[]) => ({ tag: UnionTag, schemas }) as any as Schema<InferSchemaType<TOption>>

const isUnionSchema = (schema: Schema): schema is UnionSchema => schema.tag == UnionTag

export const UnionEncoderPlugin: EncoderPlugin = {
	tag: UnionTag,
	encode(value, schema, callPlugin) {
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
	decode(data, index, schema, callPlugin) {
		assert(isUnionSchema(schema), HERE)

		return callPlugin(ensure(schema.schemas[Bleb.toNumber(data, index)], HERE))
	}
}
