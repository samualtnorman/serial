import { assert } from "@samual/lib/assert"
import type { DecoderPlugin, Schema } from "./common"

export const makeDecoder = <T>(schema: Schema<T>, plugins: DecoderPlugin[]) => {
	const tagToPluginMap = new Map(plugins.flat(20).map(plugin => {
		assert(!Array.isArray(plugin), HERE)

		return [ plugin.tag, plugin ]
	}))

	return (data: number[], index = { $: 0 }) => {
		return callPlugin(schema) as T

		function callPlugin(schema: Schema) {
			const plugin = tagToPluginMap.get(schema.tag)

			if (!plugin)
				throw Error(`Missing plugin ${schema.tag.description}`)

			return plugin.decode(data, index, schema, callPlugin)
		}
	}
}
