import { ModelTypes } from '../../definitions.ts'

// TODO: Move helpers
const whitelist = ['Mongo']

const skip = (property: string) =>
	!['get', 'update', 'create', 'remove'].includes(property)

const getProperties = (instance: Record<string, unknown>) =>
	Object.getOwnPropertyNames(instance)
		.filter(skip)
		.map((property: string) => ({
			key: property,
			type: typeof instance[property],
		}))

// TODO: Move typings
type DatabaseProvider = {
	toModel(constructor: any): any
	get: Function
	update: Function
	create: Function
	remove: Function
}

type Options = {
	overwrite: true
}

const getProvider = async (type: ModelTypes): Promise<DatabaseProvider> => {
	if (!whitelist.includes(type)) {
		throw new Error(`${type} database is not supported`)
	}

	const provider = await import(`../${type.toString().toLowerCase()}/index.ts`)

	return {
		toModel: async (constructor: any): Promise<any> =>
			provider.init(constructor.name, getProperties(new constructor())),
		get: provider.get,
		remove: provider.remove,
		create: provider.create,
		update: provider.update,
	}
}

const setup = async (type: ModelTypes, constructor: Function) => {
	const provider: DatabaseProvider = await getProvider(type)
	const model = provider.toModel(constructor)

	const newPrototype = {
		type,
		get: async () => provider.get.call(provider.get, model),
		update: async () => provider.update.call(provider.update, model),
		create: async (body: any, options: Options) =>
			provider.create.call(provider.create, model, body, options),
		remove: async () => provider.remove.call(provider.remove, model),
	}

	for (const [key, value] of Object.entries(newPrototype)) {
		constructor.prototype[key] = value
	}
}

export const Model = (type: ModelTypes) => {
	return (constructor: Function) => {
		setup(type, constructor)
	}
}
