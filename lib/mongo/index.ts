export * from './provider.ts'

import { Collection } from 'https://deno.land/x/mongo@v0.13.0/ts/collection.ts'
import { plural } from 'https://deno.land/x/deno_plural/mod.ts'
import * as log from 'https://deno.land/std/log/mod.ts'

import { validateConfig } from '../utils.ts'
import { ModelTypes } from '../../definitions.ts'
import config from '../../config.ts'

const mongoUri = `mongodb://${config.database?.mongo?.hostname}:${config.database?.mongo?.port}`

export const init = async (
	name: string,
	props: Array<any>,
): Promise<Collection<string>> => {
	validateConfig(ModelTypes.MONGO)

	const { MongoClient } = await import(
		'https://deno.land/x/mongo@v0.13.0/mod.ts'
	)

	const client = new MongoClient()

	client.connectWithUri(mongoUri)

	const db = client.database(config.database?.mongo?.database!)

	log.info(`Attached ${name} as Mongo model!`)

	const fields: Record<string, unknown> = {}

	props.forEach((prop) => {
		fields[prop.key] = prop.type
	})

	type Schema = keyof typeof fields
	return db.collection<Schema>(plural(name.toLowerCase()))
}

