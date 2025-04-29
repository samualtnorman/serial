import { assert, ensure } from "@samual/lib/assert"
import type { DecoderPlugin, Schema } from "./common"

export const makeDecoder = <T>(schema: Schema<T>, plugins: DecoderPlugin[]) => {
	const tagToPluginMap = new Map(plugins.flat(20).map(plugin => {
		assert(!Array.isArray(plugin), HERE)

		return [ plugin.tag, plugin ]
	}))

	return (data: number[], index = { $: 0 }) => {
		const callPlugin = (schema: Schema) =>
			ensure(tagToPluginMap.get(schema.tag)).decode(schema, callPlugin, data, index)

		return callPlugin(schema) as T
	}
}
