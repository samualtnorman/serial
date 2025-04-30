import type { Schema } from "./common"

export const lazySchema = <T>(getter: () => Schema<T>) => ({
	get tag() {
		Object.defineProperties(this, Object.getOwnPropertyDescriptors(getter()))

		return this.tag
	}
}) as Schema<T>
