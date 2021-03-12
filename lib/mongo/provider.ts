import {
	Collection,
	WithID,
} from 'https://deno.land/x/mongo@v0.13.0/ts/collection.ts'

export async function get(pendingModel: Promise<Collection<string>>) {
	const doc = await pendingModel
	return await doc.findOne()
}

export async function update(pendingModel: Promise<Collection<string>>) {}

export async function create(
	pendingModel: Promise<Collection<string>>,
	body: Partial<string & WithID>,
	options: any,
) {
	const doc = await pendingModel

	if (options.overwrite) {
		await doc.deleteMany({})
	}

	await doc.insertOne(body)
}

export async function remove(pendingModel: Promise<Collection<string>>) {}

