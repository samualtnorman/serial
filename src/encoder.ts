import { assert, ensure } from "@samual/lib/assert"
import type { EncoderPlugin, Schema } from "./common"

export const makeEncoder = <T>(schema: Schema<T>, plugins: EncoderPlugin[]) => {
	const tagToPluginMap = new Map(plugins.flat(20).map(plugin => {
		assert(!Array.isArray(plugin), HERE)

		return [ plugin.tag, plugin ]
	}))

	return (value: T) => ensure(callPlugin(schema, value), HERE)

	function callPlugin(schema: Schema, value: unknown) {
		const plugin = tagToPluginMap.get(schema.tag)

		if (!plugin)
			throw Error(`Missing plugin ${schema.tag.description}`)

		return plugin.encode(value, schema, callPlugin)
	}
}
