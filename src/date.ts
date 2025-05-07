import type { DecoderPlugin, EncoderPlugin, Schema } from "./common"
import { makeDecoder } from "./decoder"
import { makeEncoder } from "./encoder"
import { Int54DecoderPlugin, Int54EncoderPlugin, Int54Schema } from "./integer"

const DateTag = Symbol(`Date`)

export const DateSchema = { tag: DateTag } as Schema<Date>

export const DateEncoderPlugin: EncoderPlugin = [
	{
		tag: DateTag,
		encode(value, _schema, callPlugin) {
			if (value instanceof Date) {
				const time = value.getTime()

				return callPlugin(Int54Schema, isNaN(time) ? Number.MAX_SAFE_INTEGER : time)
			}
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

if (import.meta.vitest) {
	const { test, expect } = import.meta.vitest

	test(`valid date`, () => {
		const date = new Date(1746610869504)

		expect(decodeDate(encodeDate(date))).toStrictEqual(date)
	})

	test(`invalid date`, () => {
		const date = new Date(NaN)

		expect(decodeDate(encodeDate(date))).toStrictEqual(date)
	})
}
