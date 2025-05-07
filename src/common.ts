declare type Type = { readonly Type: unique symbol }["Type"]

export type Schema<T = unknown> = { tag: symbol } & { [K in Type]: T }

export type EncoderPlugin = {
	tag: symbol
	encode: (
		value: unknown,
		schema: Schema,
		callPlugin: <T>(schema: Schema<T>, value: T) => number[] | undefined
	) => number[] | undefined
} | EncoderPlugin[]

export type DecoderPlugin = {
	tag: symbol
	decode: (data: number[], index: { $: number }, schema: Schema, callPlugin: <T>(schema: Schema<T>) => T) => unknown
} | DecoderPlugin[]
