import * as Bleb from "bleb"

declare const Uint8Tag: unique symbol
declare const Uint16Tag: unique symbol
declare const Uint24Tag: unique symbol
declare const Uint32Tag: unique symbol
declare const Uint40Tag: unique symbol
declare const Uint48Tag: unique symbol
declare const Uint56Tag: unique symbol
declare const Uint64Tag: unique symbol
declare const Int8Tag: unique symbol
declare const Int16Tag: unique symbol
declare const Int24Tag: unique symbol
declare const Int32Tag: unique symbol
declare const Int40Tag: unique symbol
declare const Int48Tag: unique symbol
declare const Int56Tag: unique symbol
declare const Int64Tag: unique symbol

type LiteralSchema<T> = Schema<T> & { tag: typeof LiteralSchemaTag }
type UnionSchema<T> = Schema<T> & { tag: typeof UnionSchemaTag, options: Schema<T>[] }

export type Uint8 = number & { [Uint8Tag]: typeof Uint8Tag }
export type Uint16 = number & { [Uint16Tag]: typeof Uint16Tag }
export type Uint24 = number & { [Uint24Tag]: typeof Uint24Tag }
export type Uint32 = number & { [Uint32Tag]: typeof Uint32Tag }
export type Uint40 = number & { [Uint40Tag]: typeof Uint40Tag }
export type Uint48 = number & { [Uint48Tag]: typeof Uint48Tag }
export type Uint56 = number & { [Uint56Tag]: typeof Uint56Tag }
export type Uint64 = number & { [Uint64Tag]: typeof Uint64Tag }
export type Int8 = number & { [Int8Tag]: typeof Int8Tag }
export type Int16 = number & { [Int16Tag]: typeof Int16Tag }
export type Int24 = number & { [Int24Tag]: typeof Int24Tag }
export type Int32 = number & { [Int32Tag]: typeof Int32Tag }
export type Int40 = number & { [Int40Tag]: typeof Int40Tag }
export type Int48 = number & { [Int48Tag]: typeof Int48Tag }
export type Int56 = number & { [Int56Tag]: typeof Int56Tag }
export type Int64 = number & { [Int64Tag]: typeof Int64Tag }

export type Schema<T> = {
	parse: (value: unknown) => T | typeof InvalidValue
	serialize: (value: T) => number[]
	deserialize: (data: number[], index?: { $: number }) => T
}

export type SchemaType<TSchema> = TSchema extends Schema<infer T> ? T : never

const textEncoder = new TextEncoder
const textDecoder = new TextDecoder
const LiteralSchemaTag = Symbol(`LiteralSchemaTag`)
const UnionSchemaTag = Symbol(`UnionSchemaTag`)
const isLiteralSchema = <T>(schema: Schema<T>): schema is LiteralSchema<T> => `tag` in schema && schema.tag == LiteralSchemaTag
const isUnionSchema = <T>(schema: Schema<T>): schema is UnionSchema<T> => `tag` in schema && schema.tag == UnionSchemaTag

export const InvalidValue = Symbol(`InvalidValue`)

export const literal = <T>(literal: T): Schema<T> => ({
	tag: LiteralSchemaTag,
	parse: value => value === literal ? literal : InvalidValue,
	serialize: () => [],
	deserialize: () => literal
}) satisfies LiteralSchema<T> as Schema<T>

export const UndefinedSchema = literal(undefined)
export const NullSchema = literal(null)
export const FalseSchema = literal(false)
export const TrueSchema = literal(true)
export const BooleanSchema = union([ FalseSchema, TrueSchema ])
export const NullishSchema = union([ NullSchema, UndefinedSchema ])

export const array = <T>(itemSchema: Schema<T>): Schema<T[]> => {
	const parse = (value: unknown) => {
		if (!Array.isArray(value))
			return InvalidValue

		const result = Array(value.length)

		for (const [ index, item ] of value.entries()) {
			const parsed = itemSchema.parse(item)

			if (parsed == InvalidValue)
				return InvalidValue

			result[index] = parsed
		}

		return result
	}

	if (isUnionSchema(itemSchema) && itemSchema.options.length == 2 && isLiteralSchema(itemSchema.options[0]!) &&
		isLiteralSchema(itemSchema.options[1]!)
	) {
		return {
			parse,
			serialize(value) {
				const length = Bleb.fromBigInt(BigInt(value.length))
				const result = [ ...length, ...Array(Math.ceil(value.length / 8)) ]

				for (const [ index, item ] of value.entries()) {
					result[(length.length + Math.floor(index / 8))] |=
						(itemSchema.options[0]!.parse(item) == InvalidValue ? 1 : 0) << (index % 8)
				}

				return result
			},
			deserialize(data, index = { $: 0 }) {
				const length = Number(Bleb.toBigInt(data, index))
				const result = Array(length)

				for (let resultIndex = 0; resultIndex < length; resultIndex++) {
					const byteIndex = index.$ + Math.floor(resultIndex / 8)
					const offset = resultIndex % 8
					const bit = (data[byteIndex]! >> offset) & 1

					result[resultIndex] = itemSchema.options[bit]!.deserialize(data)
				}

				index.$ += Math.ceil(length / 8)

				return result
			}
		}
	}

	return {
		parse,
		serialize: value => [ ...Bleb.fromBigInt(BigInt(value.length)), ...value.flatMap(value => itemSchema.serialize(value)) ],
		deserialize(data, index = { $: 0 }) {
			const length = Number(Bleb.toBigInt(data, index))
			const result = Array(length)

			for (let resultIndex = 0; resultIndex < length; resultIndex++)
				result[resultIndex] = itemSchema.deserialize(data, index)

			return result
		}
	}
}

export const Uint8Schema: Schema<Uint8> = {
	parse: value => typeof value == `number` && value >= 0 && value < 256 ? value as Uint8 : InvalidValue,
	serialize: value => [ value ],
	deserialize: (data, index = { $: 0 }) => data[index.$++] as Uint8
}

export const Uint16Schema: Schema<Uint16> = {
	parse: value => typeof value == `number` && value >= 0 && value < 0x1_00_00 ? value as Uint16 : InvalidValue,
	serialize: value => [ ...new Uint8Array(new Uint16Array([ value ]).buffer) ],
	deserialize: (data, index = { $: 0 }) => new Uint16Array(new Uint8Array(data.slice(index.$, index.$ += 2)).buffer)[0] as Uint16
}

export const Uint24Schema: Schema<Uint24> = {
	parse: value => typeof value == `number` && value >= 0 && value < 0x1_00_00_00 ? value as Uint24 : InvalidValue,
	serialize: value => [ ...new Uint8Array(new Uint32Array([ value ]).buffer.slice(0, 3)) ],
	deserialize: (data, index = { $: 0 }) => new Uint32Array(new Uint8Array([ ...data.slice(index.$, index.$ += 3), 0 ]).buffer)[0] as Uint24
}

export const Uint32Schema: Schema<Uint32> = {
	parse: value => typeof value == `number` && value >= 0 && value < 0x1_00_00_00_00 ? value as Uint32 : InvalidValue,
	serialize: value => [ ...new Uint8Array(new Uint32Array([ value ]).buffer) ],
	deserialize: (data, index = { $: 0 }) => new Uint32Array(new Uint8Array(data.slice(index.$, index.$ += 4)).buffer)[0] as Uint32
}

export const Uint40Schema: Schema<Uint40> = {
	parse: value => typeof value == `number` && value >= 0 && value < 0x1_00_00_00_00_00 ? value as Uint40 : InvalidValue,
	serialize: value => [ ...new Uint8Array(new BigUint64Array([ BigInt(value) ]).buffer.slice(0, 5)) ],
	deserialize: (data, index = { $: 0 }) => Number(new BigUint64Array(new Uint8Array([ ...data.slice(index.$, index.$ + 5), 0, 0, 0 ]).buffer)[0]) as Uint40
}

export const Int8Schema: Schema<Int8> = {
	parse: value => typeof value == `number` && value > -129 && value < 128 ? value as Int8 : InvalidValue,
	serialize: value => [ new Uint8Array([ value ])[0]! ],
	deserialize: (data, index = { $: 0 }) => new Int8Array(data.slice(index.$, ++index.$))[0] as Int8
}

export const Uint8ArraySchema = array(Uint8Schema)

export const Uint8TypedArraySchema: Schema<Uint8Array> = {
	parse: value => value instanceof Uint8Array ? value : InvalidValue,
	serialize: value => Uint8ArraySchema.serialize([ ...value ] as any),
	deserialize: (data, index) => new Uint8Array(Uint8ArraySchema.deserialize(data, index))
}

export const BigUintSchema: Schema<bigint> =
	{ parse: value => typeof value == `bigint` && value >= 0 ? value : InvalidValue, serialize: Bleb.fromBigInt, deserialize: Bleb.toBigInt }

export const Float64Schema: Schema<number> = {
	parse: value => typeof value == `number` ? value : InvalidValue,
	serialize: value => [ ...new Uint8Array(new Float64Array([ value ]).buffer) ],
	deserialize: (data, index = { $: 0 }) => new Float64Array(new Uint8Array(data.slice(index.$, index.$ += 8)).buffer)[0]!
}

export const ArrayBufferSchema: Schema<ArrayBuffer> = {
	parse: value => value instanceof ArrayBuffer ? value : InvalidValue,
	serialize: value => Uint8TypedArraySchema.serialize(new Uint8Array(value)),
	deserialize: (data, index) => Uint8TypedArraySchema.deserialize(data, index).buffer
}

export const Float64ArraySchema: Schema<Float64Array> = {
	parse: value => value instanceof Float64Array ? value : InvalidValue,
	serialize: value => array(Float64Schema).serialize([ ...value ]),
	deserialize: (data, index) => new Float64Array(array(Float64Schema).deserialize(data, index))
}

export const StringSchema: Schema<string> = {
	parse: value => typeof value == `string` ? value : InvalidValue,
	serialize: value => Uint8TypedArraySchema.serialize(textEncoder.encode(value)),
	deserialize: (data, index) => textDecoder.decode(Uint8TypedArraySchema.deserialize(data, index))
}

export function union<TOption extends Schema<any>>(optionSchemas: TOption[]): Schema<SchemaType<TOption>> {
	if (optionSchemas.length == 1)
		return optionSchemas[0]!

	const flattenedSchemas: Schema<any>[] = []

	for (const schema of optionSchemas) {
		if (isUnionSchema(schema))
			flattenedSchemas.push(...schema.options)
		else
			flattenedSchemas.push(schema)
	}

	return {
		tag: UnionSchemaTag,
		options: flattenedSchemas,
		parse(value) {
			for (const schema of flattenedSchemas) {
				const parsedValue = schema.parse(value)

				if (parsedValue != InvalidValue)
					return parsedValue
			}

			return InvalidValue
		},
		serialize(value) {
			for (const [ index, schema ] of flattenedSchemas.entries()) {
				const parsedValue = schema.parse(value)

				if (parsedValue != InvalidValue)
					return [ ...Bleb.fromBigInt(BigInt(index)), ...schema.serialize(parsedValue) ]
			}

			console.error(value)

			throw Error(`Value did not fit any schema`)
		},
		deserialize: (data, index = { $: 0 }) => flattenedSchemas[Number(Bleb.toBigInt(data, index))]!.deserialize(data, index)
	} satisfies UnionSchema<SchemaType<TOption>> as Schema<any>
}
