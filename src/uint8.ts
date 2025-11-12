import { makeDecoder, makeEncoder, type DecoderPlugin, type EncoderPlugin, type Schema } from "."
import { ensureNotNullish } from "./internal"

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
    { tag: Uint8Tag, decode: (data, index): number => ensureNotNullish(data[index.$++], HERE) }

export const encodeUint8 = makeEncoder(Uint8Schema, [ Uint8EncoderPlugin ])
export const decodeUint8 = makeDecoder(Uint8Schema, [ Uint8DecoderPlugin ])

if (import.meta.vitest) {
    const { test, expect } = import.meta.vitest

    test(`works`, () => {
        for (const item of [ 0, 255, 1, 163, 90, 86, 209 ])
            expect(decodeUint8(encodeUint8(item))).toBe(item)
    })
}
