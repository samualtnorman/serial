import type { JsonValue } from "@samual/lib"
import { arraySchema } from "./array"
import { BooleanDecoderPlugin, BooleanEncoderPlugin, BooleanSchema } from "./boolean"
import type { Schema } from "./common"
import { makeDecoder } from "./decoder"
import { makeEncoder } from "./encoder"
import { Float64DecoderPlugin, Float64EncoderPlugin, Float64Schema } from "./float64"
import { lazySchema } from "./lazy"
import { NullSchema } from "./literal"
import { RecordDecoderPlugin, RecordEncoderPlugin, recordSchema } from "./record"
import { StringDecoderPlugin, StringEncoderPlugin, StringSchema } from "./string"
import { unionSchema } from "./union"

export const JsonValueSchema: Schema<JsonValue> = unionSchema([
	NullSchema,
	BooleanSchema,
	Float64Schema,
	StringSchema,
	arraySchema(lazySchema(() => JsonValueSchema)),
	recordSchema(StringSchema, lazySchema(() => JsonValueSchema))
])

export const JsonValueEncoderPlugin =
	[ BooleanEncoderPlugin, Float64EncoderPlugin, StringEncoderPlugin, RecordEncoderPlugin ]

export const JsonValueDecoderPlugin =
	[ BooleanDecoderPlugin, Float64DecoderPlugin, StringDecoderPlugin, RecordDecoderPlugin ]

export const encodeJsonValue = makeEncoder(JsonValueSchema, JsonValueEncoderPlugin)
export const decodeJsonValue = makeDecoder(JsonValueSchema, JsonValueDecoderPlugin)
