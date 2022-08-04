import { ServerRequest } from 'https://deno.land/std@0.78.0/http/server.ts'

import { ModelTypes } from '../definitions.ts'

export const capitalize = (string: string) => {
	return string.charAt(0).toUpperCase() + string.slice(1)
}

export const getPathsCombined = (url: string) => {
	const parts = url.split('/')
	let path = ''

	parts.forEach((part) => {
		path += capitalize(part)
	})

	return path + 'mozapi'
}

export const getBase = (url: string) => {
	const parts = url.split('/')
	return parts.length > 0 ? `/${parts[1]}` : '/'
}

export const failure = async (
	req: ServerRequest,
	status: number,
	message: string,
) => {
	req.respond({
		status,
		body: message,
	})
}

export const success = (req: ServerRequest, status: number, result: any) => {
	const headers = new Headers()

	headers.set('Content-Type', 'application/json')

	req.respond({
		status,
		headers,
		body: JSON.stringify(result),
	})
}

export const toJSONSafe = (data: string): Object => {
	try {
		return JSON.parse(data)
	} catch (error) {
		return {}
	}
}

export function validateEnvVars(varNames: string[]) {
	const missingVars = (varNames || []).filter(
		(varName) => !Deno.env.get(varName),
	)

	if (missingVars && missingVars.length > 0)
		throw new Error(
			'Environment variables still required be set: ' + missingVars.join(', '),
		)
}

export const validateConfig = (type: ModelTypes) => {
	const mongoVarsNeeded: Array<string> = [
		'MONGO_HOSTNAME',
		'MONGO_DATABASE',
		'MONGO_PORT',
	]
	const sqlVarsNeeded: Array<string> = [
		'SQL_HOSTNAME',
		'SQL_DATABASE',
		'SQL_USER',
		'SQL_PASSWORD',
	]
	let missingVars = new Array()

	switch (type) {
		case ModelTypes.MONGO:
			missingVars = mongoVarsNeeded.filter((varName) => !Deno.env.get(varName))
			break
		case ModelTypes.MYSQL:
			missingVars = sqlVarsNeeded.filter((varName) => !Deno.env.get(varName))
			break
	}

	if (missingVars && missingVars.length > 0) {
		throw new Error(
			'Environment variables are missing: ' + missingVars.join(', '),
		)
	}
}
