import type { DecoderPlugin, EncoderPlugin } from "./common"
import { FalseSchema, LiteralDecoderPlugin, LiteralEncoderPlugin, TrueSchema } from "./literal"
import { UnionDecoderPlugin, UnionEncoderPlugin, unionSchema } from "./union"

export const BooleanSchema = unionSchema([ FalseSchema, TrueSchema ])
export const BooleanEncoderPlugin: EncoderPlugin = [ LiteralEncoderPlugin, UnionEncoderPlugin ]
export const BooleanDecoderPlugin: DecoderPlugin = [ LiteralDecoderPlugin, UnionDecoderPlugin ]
