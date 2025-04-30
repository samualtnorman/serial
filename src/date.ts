import type { DecoderPlugin, EncoderPlugin, Schema } from "./common"
import { Int54DecoderPlugin, Int54EncoderPlugin, Int54Schema } from "./Int54"

const DateTag = Symbol(`Date`)

export const DateSchema = { tag: DateTag } as Schema<Date>

export const DateEncoderPlugin: EncoderPlugin = [
	{
		tag: DateTag,
		encode(_, callPlugin, value) {
			if (value instanceof Date)
				return callPlugin(Int54Schema, value.getTime())
		}
	},
	Int54EncoderPlugin
]

export const DateDecoderPlugin: DecoderPlugin = [
	{
		tag: DateTag,
		decode(_schema, callPlugin, _data, _index) {
			return new Date(callPlugin(Int54Schema))
		}
	},
	Int54DecoderPlugin
]
