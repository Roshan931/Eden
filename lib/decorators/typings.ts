export type DatabaseProvider = {
	toModel(constructor: any): any
	get: Function
	getAll: Function
	update: Function
	create: Function
	remove: Function
}

export type Options = {
	overwrite?: boolean
}

export type Query = Record<string, unknown>
export type Data = Record<string, unknown>
