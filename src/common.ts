import { ArrayDecoderPlugin, ArrayEncoderPlugin, arraySchema } from "./array"
import { BooleanSchema } from "./boolean"
import { makeDecoder } from "./decoder"
import { makeEncoder } from "./encoder"
import { Float64DecoderPlugin, Float64EncoderPlugin, Float64Schema } from "./float64"
import { FixedLengthHexStringDecoderPlugin, FixedLengthHexStringEncoderPlugin, fixedLengthHexStringSchema } from "./hex"
import { Int54DecoderPlugin, Int54EncoderPlugin, Int54Schema, Uint8DecoderPlugin, Uint8EncoderPlugin, Uint8Schema } from "./integer"
import { LiteralDecoderPlugin, LiteralEncoderPlugin, literalSchema } from "./literal"
import { ObjectDecoderPlugin, ObjectEncoderPlugin, objectSchema } from "./object"
import { StringDecoderPlugin, StringEncoderPlugin, StringSchema } from "./string"
import { UnionDecoderPlugin, UnionEncoderPlugin, unionSchema } from "./union"

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

export type InferSchemaType<TSchema extends Schema> = TSchema extends Schema<infer T> ? T : never

if (import.meta.vitest) {
	const { test, expect } = import.meta.vitest
	const GuidTag = Symbol(`Guid`)
	const GuidSchema = { tag: GuidTag } as Schema<string>

	const Hex16ByteStringSchema = fixedLengthHexStringSchema(16)

	const GuidEncoderPlugin: EncoderPlugin = [
		FixedLengthHexStringEncoderPlugin,
		{
			tag: GuidTag,
			encode(value, _schema, callPlugin) {
				if (typeof value == `string`)
					return callPlugin(Hex16ByteStringSchema, value.replaceAll(`-`, ``))
			}
		}
	]

	const GuidDecoderPlugin: DecoderPlugin = [
		FixedLengthHexStringDecoderPlugin,
		{
			tag: GuidTag,
			decode(_data, _index, _schema, callPlugin) {
				const hex = callPlugin(Hex16ByteStringSchema)

				return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
			}
		}
	]

	const BalanceTag = Symbol(`Balance`)
	const BalanceSchema = { tag: BalanceTag } as Schema<string>

	const BalanceEncoderPlugin: EncoderPlugin = [
		Int54EncoderPlugin,
		{
			tag: BalanceTag,
			encode(value, _schema, callPlugin) {
				if (typeof value == `string` && /^\$\d\d?\d?(,\d\d\d)*\.\d\d$/.test(value))
					return callPlugin(Int54Schema, parseInt(value.slice(1).replaceAll(`,`, ``).replaceAll(`.`, ``)))
			}
		}
	]

	const BalanceDecoderPlugin: DecoderPlugin = [
		Int54DecoderPlugin,
		{
			tag: BalanceTag,
			decode: (_data, _index, _schema, callPlugin) =>
				(callPlugin(Int54Schema) / 100).toLocaleString("en-US", { style: `currency`, currency: `USD` })
		}
	]

	const UsersSchema = arraySchema(objectSchema({
		_id: fixedLengthHexStringSchema(12),
		index: Int54Schema,
		guid: GuidSchema,
		isActive: BooleanSchema,
		balance: BalanceSchema,
		picture: StringSchema,
		age: Uint8Schema,
		eyeColor: unionSchema([ literalSchema(`blue`), literalSchema(`brown`), literalSchema(`green`) ]),
		name: StringSchema,
		gender: StringSchema,
		company: StringSchema,
		email: StringSchema,
		phone: StringSchema,
		address: StringSchema,
		about: StringSchema,
		registered: StringSchema,
		latitude: Float64Schema,
		longitude: Float64Schema,
		tags: arraySchema(StringSchema),
		friends: arraySchema(objectSchema({ id: Int54Schema, name: StringSchema })),
		greeting: StringSchema,
		favoriteFruit: unionSchema([ literalSchema(`apple`), literalSchema(`banana`), literalSchema(`strawberry`) ])
	}))

	type Users = InferSchemaType<typeof UsersSchema>

	const users: Users = [{"_id":"681b226643c56a024f7e8f2e","index":0,"guid":"08f6df9d-1eb3-4521-bfb6-8e56ed5d14ca","isActive":true,"balance":"$3,729.26","picture":"http://placehold.it/32x32","age":39,"eyeColor":"brown","name":"Martinez Powell","gender":"male","company":"PODUNK","email":"martinezpowell@podunk.com","phone":"+1 (945) 467-3173","address":"406 Beverly Road, Groton, Colorado, 269","about":"Ipsum id incididunt Lorem enim culpa et laboris pariatur Lorem commodo tempor. Voluptate eiusmod nisi commodo amet labore ex proident fugiat exercitation commodo nostrud reprehenderit aliqua. Aute laboris laborum cillum anim non est incididunt elit qui consequat incididunt eu. Labore proident ipsum dolore veniam id ad eu eu in labore dolore. Sit culpa labore laborum ex enim commodo Lorem. Aute sint nisi aliquip sint culpa in cillum tempor officia id consectetur proident proident.\r\n","registered":"2015-03-08T11:46:14 -00:00","latitude":-26.293662,"longitude":175.853296,"tags":["adipisicing","culpa","minim","veniam","exercitation","deserunt","duis"],"friends":[{"id":0,"name":"Alford Hale"},{"id":1,"name":"Cross Moss"},{"id":2,"name":"Frankie Avery"}],"greeting":"Hello, Martinez Powell! You have 9 unread messages.","favoriteFruit":"apple"},{"_id":"681b226635b4fa801d75a853","index":1,"guid":"07297d4e-3f33-4707-b967-b0c09f2023c4","isActive":true,"balance":"$1,864.28","picture":"http://placehold.it/32x32","age":26,"eyeColor":"blue","name":"Humphrey Ballard","gender":"male","company":"KROG","email":"humphreyballard@krog.com","phone":"+1 (948) 511-3578","address":"714 Sumner Place, Gorst, Hawaii, 4643","about":"Enim dolore veniam consequat tempor nostrud duis do. Ullamco exercitation exercitation officia elit magna in nisi et. Deserunt ut do labore commodo enim eiusmod incididunt sit. Ipsum labore nisi elit in. Nostrud labore labore do ullamco nulla aute esse fugiat laborum excepteur dolore dolore irure.\r\n","registered":"2017-01-06T11:06:36 -00:00","latitude":37.639894,"longitude":-101.414757,"tags":["non","velit","ea","aliquip","dolore","ea","pariatur"],"friends":[{"id":0,"name":"Sanford Pugh"},{"id":1,"name":"Eugenia Rogers"},{"id":2,"name":"Cochran Barron"}],"greeting":"Hello, Humphrey Ballard! You have 7 unread messages.","favoriteFruit":"apple"},{"_id":"681b226616f2db2709d03656","index":2,"guid":"75bc0a87-ad0e-4e21-96ff-48208adf17a3","isActive":true,"balance":"$3,133.32","picture":"http://placehold.it/32x32","age":20,"eyeColor":"green","name":"Delia Porter","gender":"female","company":"EPLOSION","email":"deliaporter@eplosion.com","phone":"+1 (979) 561-3923","address":"559 Burnett Street, Herbster, New Hampshire, 7987","about":"Esse veniam irure qui occaecat in mollit dolor. Excepteur voluptate laborum exercitation magna occaecat nulla pariatur magna et minim est. Laboris consequat ad deserunt magna eiusmod ea do reprehenderit irure sint adipisicing mollit proident consequat. Ipsum esse qui ad veniam qui laborum ut culpa minim id pariatur voluptate non ipsum. Officia et aliquip mollit exercitation dolore ipsum labore ea sint.\r\n","registered":"2024-02-19T12:42:54 -00:00","latitude":-44.373244,"longitude":-105.825201,"tags":["adipisicing","mollit","exercitation","labore","enim","excepteur","reprehenderit"],"friends":[{"id":0,"name":"Christi Wheeler"},{"id":1,"name":"Francis Olsen"},{"id":2,"name":"Livingston Santos"}],"greeting":"Hello, Delia Porter! You have 5 unread messages.","favoriteFruit":"banana"},{"_id":"681b226608c8864163c0020b","index":3,"guid":"98140d34-9a28-415b-ac93-ae9e193b81e5","isActive":true,"balance":"$1,309.85","picture":"http://placehold.it/32x32","age":32,"eyeColor":"green","name":"Amparo Velasquez","gender":"female","company":"VORTEXACO","email":"amparovelasquez@vortexaco.com","phone":"+1 (848) 438-2868","address":"347 Dunne Court, Hayes, Virgin Islands, 7007","about":"Do culpa sunt minim laboris fugiat eiusmod. Qui enim officia id in voluptate sunt cupidatat ad et voluptate sit. In reprehenderit do nulla officia velit anim pariatur quis reprehenderit exercitation Lorem incididunt incididunt. Duis do reprehenderit adipisicing enim incididunt cupidatat cupidatat voluptate aliqua. Deserunt excepteur ad id incididunt deserunt elit qui aliqua cillum cupidatat fugiat adipisicing amet. Tempor sunt exercitation velit in sunt.\r\n","registered":"2020-06-01T09:47:04 -01:00","latitude":50.275473,"longitude":99.452243,"tags":["cillum","cillum","sit","commodo","ea","nostrud","nisi"],"friends":[{"id":0,"name":"Ana Clements"},{"id":1,"name":"Rice Riggs"},{"id":2,"name":"Chan Gamble"}],"greeting":"Hello, Amparo Velasquez! You have 8 unread messages.","favoriteFruit":"banana"},{"_id":"681b2266cbb84a3972f312a5","index":4,"guid":"30839d0d-1721-4172-b181-9c5814d302c1","isActive":true,"balance":"$3,195.07","picture":"http://placehold.it/32x32","age":34,"eyeColor":"green","name":"Katrina Mcclain","gender":"female","company":"ULTRIMAX","email":"katrinamcclain@ultrimax.com","phone":"+1 (862) 454-3799","address":"803 Navy Street, Brantleyville, Rhode Island, 3650","about":"Veniam adipisicing dolor do pariatur duis qui esse veniam. Eu minim ex culpa voluptate velit Lorem fugiat veniam id voluptate amet excepteur. Anim tempor mollit minim ullamco esse in eiusmod sit eiusmod fugiat. Exercitation dolor aute id elit ullamco. Velit et officia esse qui aliquip sint voluptate dolore nulla proident sit.\r\n","registered":"2018-10-06T07:57:16 -01:00","latitude":-51.046203,"longitude":55.938,"tags":["aliquip","incididunt","eiusmod","qui","cillum","laborum","id"],"friends":[{"id":0,"name":"Abby Campos"},{"id":1,"name":"Britney Chandler"},{"id":2,"name":"Murphy Short"}],"greeting":"Hello, Katrina Mcclain! You have 7 unread messages.","favoriteFruit":"banana"},{"_id":"681b2266b6531b90fd296818","index":5,"guid":"2dfb6ed8-6384-4b91-9f1d-28f263073531","isActive":true,"balance":"$1,607.11","picture":"http://placehold.it/32x32","age":31,"eyeColor":"brown","name":"Mcfarland Nolan","gender":"male","company":"CUIZINE","email":"mcfarlandnolan@cuizine.com","phone":"+1 (842) 440-3424","address":"629 Bridgewater Street, Weeksville, Connecticut, 5228","about":"Culpa labore cupidatat consequat exercitation aliqua commodo aliqua dolor eu reprehenderit magna et. Pariatur esse officia enim id ut ad enim reprehenderit dolore culpa dolor dolor. Et adipisicing fugiat proident tempor voluptate enim ipsum sint. Incididunt sunt magna amet nisi in et.\r\n","registered":"2020-07-09T11:33:27 -01:00","latitude":45.784124,"longitude":-142.260993,"tags":["ex","ut","esse","irure","laborum","dolore","esse"],"friends":[{"id":0,"name":"Megan Benton"},{"id":1,"name":"Nellie Scott"},{"id":2,"name":"Horn Hebert"}],"greeting":"Hello, Mcfarland Nolan! You have 1 unread messages.","favoriteFruit":"strawberry"}]

	const encodeUsers = makeEncoder(UsersSchema, [
		ArrayEncoderPlugin, ObjectEncoderPlugin, FixedLengthHexStringEncoderPlugin, Int54EncoderPlugin,
		GuidEncoderPlugin, UnionEncoderPlugin, LiteralEncoderPlugin, BalanceEncoderPlugin, StringEncoderPlugin,
		Uint8EncoderPlugin, Float64EncoderPlugin
	])

	const decodeUsers = makeDecoder(UsersSchema, [
		ArrayDecoderPlugin, ObjectDecoderPlugin, FixedLengthHexStringDecoderPlugin, Int54DecoderPlugin,
		GuidDecoderPlugin, UnionDecoderPlugin, LiteralDecoderPlugin, BalanceDecoderPlugin, StringDecoderPlugin,
		Uint8DecoderPlugin, Float64DecoderPlugin
	])

	test(`generated json`, () => {
		expect(decodeUsers(encodeUsers(users))).toStrictEqual(users)
	})
}
