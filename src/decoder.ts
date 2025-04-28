import { ensure } from "@samual/lib/assert"
import type { DecoderPlugin, Schema } from "./common"

export const makeDecoder = (schema: Schema, plugins: DecoderPlugin[]) => {
	const tagToPluginMap = new Map(plugins.map(plugin => [ plugin.tag, plugin ]))

	const callPlugin = (schema: Schema, data: number[], index?: { $: number }) =>
		ensure(tagToPluginMap.get(schema.tag)).decode(schema, callPlugin, data, index)

	return (data: number[], index?: { $: number }) => callPlugin(schema, data, index)
}