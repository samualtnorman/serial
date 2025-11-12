import { AssertError } from "@samual/lib/assert"

export const ensureNotNullish = <T>(value: T, message: string | ((value: T & (undefined | null)) => string) = value => `Unexpected ${value}`) => {
	if (value == null)
		throw new AssertError(typeof message == `string` ? message : message(value as any))

	return value
}
