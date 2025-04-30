import type { DecoderPlugin, EncoderPlugin, Schema } from "./common"
import * as Bleb from "bleb"

const StringTag = Symbol(`String`)

export const StringSchema = { tag: StringTag } as Schema<string>

export const StringEncoderPlugin: EncoderPlugin = {
	tag: StringTag,
	encode(_schema, _callPlugin, value) {
		if (typeof value == `string`) {
			const encoded = new TextEncoder().encode(value)

			return [ ...Bleb.fromNumber(encoded.length), ...encoded ]
		}
	}
}

export const StringDecoderPlugin: DecoderPlugin = {
	tag: StringTag,
	decode: (_schema, _callPlugin, data, index) => {
		const length = Bleb.toNumber(data, index)

		return new TextDecoder().decode(new Uint8Array(data.slice(index.$, index.$ += length)))
	}
}
