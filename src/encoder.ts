import { ensure } from "@samual/lib/assert"
import { AutoWeakMap } from "@samual/lib/AutoMap"
import type { EncoderPlugin, Schema } from "./common"

export const makeEncoder = (schema: Schema, plugins: EncoderPlugin[]) => {
	const schemaToPluginMap = new AutoWeakMap((schema: Schema) => plugins.find(plugin => plugin.tag == schema.tag))
	const callPlugin = (schema: Schema, value: unknown) => ensure(schemaToPluginMap.get(schema), HERE).encode(schema, callPlugin, value)

	return (value: unknown) => ensure(callPlugin(schema, value), HERE)
}
