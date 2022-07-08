export const skipKeywords = (property: string) =>
	!['get', 'update', 'create', 'remove'].includes(property)

export const getProperties = (instance: Record<string, unknown>) =>
	Object.getOwnPropertyNames(instance)
		.filter(skipKeywords)
		.map((property: string) => ({
			key: property,
			type: typeof instance[property],
		}))
