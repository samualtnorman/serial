import { ensure } from "@samual/lib/assert"
import type { EncoderPlugin, Schema } from "./common"

export const makeEncoder = (schema: Schema, plugins: EncoderPlugin[]) => {
	const tagToPluginMap = new Map(plugins.map(plugin => [ plugin.tag, plugin ]))
	
	const callPlugin = (schema: Schema, value: unknown) =>
		ensure(tagToPluginMap.get(schema.tag), HERE).encode(schema, callPlugin, value)

	return (value: unknown) => ensure(callPlugin(schema, value), HERE)
}
