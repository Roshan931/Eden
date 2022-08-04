import { ModelTypes } from '../../definitions.ts'
import { getProperties } from './helpers.ts'
import { DatabaseProvider, Options, Data, Query } from './typings.ts'

type Body = Data & {
	body: Data
}

const getProvider = async (type: ModelTypes): Promise<DatabaseProvider> => {
	if (!['Mongo'].includes(type)) {
		throw new Error(`${type} database is not supported`)
	}

	const provider = await import(`../${type.toString().toLowerCase()}/index.ts`)

	return {
		...provider,
		toModel: async (constructor: any): Promise<any> =>
			provider.init(constructor.name, getProperties(new constructor())),
	}
}

const setup = async (type: ModelTypes, constructor: Function) => {
	const provider: DatabaseProvider = await getProvider(type)
	const model = provider.toModel(constructor)

	const newPrototype = {
		type,
		get: async (query: Query) => provider.get.call(provider.get, model, query),
		getAll: async (query: Query) =>
			provider.getAll.call(provider.get, model, query),
		update: async (query: Query, data: Body) =>
			provider.update.call(provider.update, model, query, data.body),
		create: async (data: Body, options: Options = {}) =>
			provider.create.call(provider.create, model, data.body, options),
		remove: async (query: Query) =>
			provider.remove.call(provider.remove, model, query),
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
