import { ensure } from "@samual/lib/assert"
import { AutoWeakMap } from "@samual/lib/AutoMap"
import type { DecoderPlugin, Schema } from "./common"

export const makeDecoder = (schema: Schema, plugins: DecoderPlugin[]) => {
	const schemaToPluginMap = new AutoWeakMap((schema: Schema) => plugins.find(plugin => plugin.tag == schema.tag))

	const callPlugin = (schema: Schema, data: number[], index?: { $: number }) =>
		ensure(schemaToPluginMap.get(schema)).decode(schema, callPlugin, data, index)

	return (data: number[], index?: { $: number }) => callPlugin(schema, data, index)
}