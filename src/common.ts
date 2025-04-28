export type Schema = { tag: symbol }

export type EncoderPlugin = {
	tag: symbol,
	encode: (
		schema: Schema,
		callPlugin: (schema: Schema, value: unknown) => number[] | undefined,
		value: unknown
	) => number[] | undefined
}

export type DecoderPlugin = {
	tag: symbol,
	decode: (
		schema: Schema,
		callPlugin: (schema: Schema, data: number[], index?: { $: number }) => unknown,
		data: number[],
		index?: { $: number }
	) => unknown
}