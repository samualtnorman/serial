import type { DecoderPlugin, EncoderPlugin, Schema } from "./common"
import { makeDecoder } from "./decoder"
import { makeEncoder } from "./encoder"
import { Int54DecoderPlugin, Int54EncoderPlugin, Int54Schema } from "./Int54"

const DateTag = Symbol(`Date`)

export const DateSchema = { tag: DateTag } as Schema<Date>

export const DateEncoderPlugin: EncoderPlugin = [
	{
		tag: DateTag,
		encode(value, _schema, callPlugin) {
			if (value instanceof Date)
				return callPlugin(Int54Schema, value.getTime())
		}
	},
	Int54EncoderPlugin
]

export const DateDecoderPlugin: DecoderPlugin = [
	{
		tag: DateTag,
		decode(_data, _index, _schema, callPlugin) {
			return new Date(callPlugin(Int54Schema))
		}
	},
	Int54DecoderPlugin
]

export const encodeDate = makeEncoder(DateSchema, [ DateEncoderPlugin ])
export const decodeDate = makeDecoder(DateSchema, [ DateDecoderPlugin ])
