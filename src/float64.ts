import { DecoderPlugin, EncoderPlugin, Schema } from "./common"

const Float64Tag = Symbol()

export const Float64Schema = { tag: Float64Tag } as Schema<number>

export const Float64EncoderPlugin: EncoderPlugin = {
	tag: Float64Tag,
	encode(_schema, _callPlugin, value) {
		if (typeof value == `number`)
			return [ ...new Uint8Array(new Float64Array([ value ]).buffer) ]
	}
}

export const Float64DecoderPlugin: DecoderPlugin = {
	tag: Float64Tag,
	decode: (_schema, _callPlugin, data, index) =>
		new Float64Array(new Uint8Array(data.slice(index.$, index.$ += 8)).buffer)[0]
}
