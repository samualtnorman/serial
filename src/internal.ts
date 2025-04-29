export const getKeys = (value: unknown) => [ ...Object.getOwnPropertyNames(value), ...Object.getOwnPropertySymbols(value) ]
