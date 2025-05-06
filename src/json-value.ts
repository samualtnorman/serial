import type { JsonValue } from "@samual/lib"
import { ArrayDecoderPlugin, ArrayEncoderPlugin, arraySchema } from "./array"
import { BooleanSchema } from "./boolean"
import type { Schema } from "./common"
import { makeDecoder } from "./decoder"
import { makeEncoder } from "./encoder"
import { Float64DecoderPlugin, Float64EncoderPlugin, Float64Schema } from "./float64"
import { lazySchema } from "./lazy"
import { LiteralDecoderPlugin, LiteralEncoderPlugin } from "./literal"
import { NullSchema } from "./null"
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

export const encodeJsonValue = makeEncoder(
	JsonValueSchema,
	[ LiteralEncoderPlugin, Float64EncoderPlugin, StringEncoderPlugin, ArrayEncoderPlugin, RecordEncoderPlugin ]
)

export const decodeJsonValue = makeDecoder(
	JsonValueSchema,
	[ LiteralDecoderPlugin, Float64DecoderPlugin, StringDecoderPlugin, ArrayDecoderPlugin, RecordDecoderPlugin ]
)
