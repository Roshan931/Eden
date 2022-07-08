import {
	Collection,
	WithID,
} from 'https://deno.land/x/mongo@v0.13.0/ts/collection.ts'

import { Data, Query } from '../decorators/typings.ts'

export async function get(
	model: Promise<Collection<Data>>,
	query: Query = {},
): Promise<(Data & WithID) | null> {
	const doc = await model
	return doc.findOne(query)
}

export async function getAll(
	model: Promise<Collection<Data>>,
	query: Query = {},
): Promise<Data[]> {
	const doc = await model
	return doc.find(query)
}

export async function update(
	model: Promise<Collection<Data>>,
	query: Query,
	data: Data,
): Promise<void> {
	const doc = await model
	await doc.updateOne(query, data)
}

export async function create(
	model: Promise<Collection<Data>>,
	data: Partial<Data & WithID>,
	options: any,
): Promise<void> {
	const doc = await model

	if (options.overwrite) {
		await doc.deleteMany({})
	}

	//data.id = v4()

	await doc.insertOne(data)
}

export async function remove(
	model: Promise<Collection<Data>>,
	query: Query = {},
): Promise<void> {
	const doc = await model
	await doc.deleteOne(query)
}
