import type { JsonValue } from "@samual/lib"
import { arraySchema } from "./array"
import { BooleanSchema } from "./boolean"
import type { Schema } from "./common"
import { Float64Schema } from "./float64"
import { lazySchema } from "./lazy"
import { NullSchema } from "./null"
import { recordSchema } from "./record"
import { StringSchema } from "./string"
import { unionSchema } from "./union"

export const JsonValueSchema: Schema<JsonValue> = unionSchema([
	NullSchema,
	BooleanSchema,
	Float64Schema,
	StringSchema,
	arraySchema(lazySchema(() => JsonValueSchema)),
	recordSchema(StringSchema, lazySchema(() => JsonValueSchema))
])
