import { FalseSchema } from "./false"
import { TrueSchema } from "./true"
import { unionSchema } from "./union"

export const BooleanSchema = unionSchema([ FalseSchema, TrueSchema ])
