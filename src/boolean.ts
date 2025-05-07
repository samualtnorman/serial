import { FalseSchema, TrueSchema } from "./literal"
import { unionSchema } from "./union"

export const BooleanSchema = unionSchema([ FalseSchema, TrueSchema ])
