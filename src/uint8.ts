import { ensure } from "@samual/lib/assert"
import type { DecoderPlugin, EncoderPlugin, Schema } from "."

const Uint8Tag = Symbol(`Uint8`)

export const Uint8Schema = { tag: Uint8Tag } as Schema<number>

export const Uint8EncoderPlugin: EncoderPlugin = {
    tag: Uint8Tag,
    encode(value) {
        if (typeof value == `number` && value >= 0 && value <= 0xFF)
            return [value]
    }
}

export const Uint8DecoderPlugin: DecoderPlugin =
    { tag: Uint8Tag, decode: (data, index): number => ensure(data[index.$++]) }
