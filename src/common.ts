declare type Type = { readonly Type: unique symbol }["Type"]

export type Schema<T = unknown> = { tag: symbol } & { [K in Type]: T }

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
	decode: (schema: Schema, callPlugin: (schema: Schema) => unknown, data: number[], index: { $: number }) => unknown
}
