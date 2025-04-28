import { assert, ensure } from "@samual/lib/assert"
import * as Bleb from "bleb"
import type { DecoderPlugin, EncoderPlugin, Schema } from "./common"

const UnionTag = Symbol()
type UnionTag = typeof UnionTag

export type UnionSchema = Schema & { tag: UnionTag, schemas: Schema[] }
export const unionSchema = (schemas: Schema[]): UnionSchema => ({ tag: UnionTag, schemas })

const isUnionSchema = (schema: Schema): schema is UnionSchema => schema.tag == UnionTag

export const UnionEncoderPlugin: EncoderPlugin = {
	tag: UnionTag,
	encode(schema, callPlugin, value) {
		assert(isUnionSchema(schema), HERE)
		
		for (const [ index, subschema ] of schema.schemas.entries()) {
			const encoded = callPlugin(subschema, value)

			if (encoded)
				return [ ...Bleb.fromBigInt(BigInt(index)), ...encoded ]
		}
	}
}

export const UnionDecoderPlugin: DecoderPlugin = {
	tag: UnionTag,
	decode(schema, callPlugin, data, index = { $: 0 }) {
		assert(isUnionSchema(schema), HERE)
		
		return callPlugin(ensure(schema.schemas[Number(Bleb.toBigInt(data,index))], HERE), data, index)
	}
}