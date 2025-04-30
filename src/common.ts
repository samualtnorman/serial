declare type Type = { readonly Type: unique symbol }["Type"]

export type Schema<T = unknown> = { tag: symbol } & { [K in Type]: T }

export type EncoderPlugin = {
	tag: symbol
	encode: (
		schema: Schema,
		callPlugin: <T>(schema: Schema<T>, value: T) => number[] | undefined,
		value: unknown
	) => number[] | undefined
} | EncoderPlugin[]

export type DecoderPlugin = {
	tag: symbol
	decode: (schema: Schema, callPlugin: <T>(schema: Schema<T>) => T, data: number[], index: { $: number }) => unknown
} | DecoderPlugin[]
