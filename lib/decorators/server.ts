import {
	serve,
	serveTLS,
	ServerRequest,
} from 'https://deno.land/std@0.78.0/http/server.ts'
import * as log from 'https://deno.land/std/log/mod.ts'

import { HttpCodes } from '../../definitions.ts'
import {
	getBase,
	getPathsCombined,
	capitalize,
	success,
	failure,
} from '../utils.ts'
import {
	ControllerNotFoundError,
	HandlerNotFoundError,
	InvalidRequestError,
} from '../errors.ts'
import config from '../../config.ts'

const getController = (url: string, controllers: Array<Function>): Function => {
	const base = getBase(url)
	const controller = controllers.find((c) => c.prototype.baseUrl === base)

	if (!controller) {
		throw new ControllerNotFoundError()
	}

	return controller
}

const getHandler = (
	url: string,
	method: string,
	controller: Function,
): Function => {
	const base = getBase(url)
	const childPaths = getPathsCombined(url).replace(
		capitalize(base.substr(1, base.length - 1)),
		'',
	)
	const handler = controller.prototype[method.toLowerCase() + childPaths]
	if (!handler || !handler.call) {
		throw new HandlerNotFoundError()
	}

	return handler
}

const getErrorHandler = (controller: Function | undefined): Function => {
	return controller
		? controller.prototype['onError']
		: (error: any, req: ServerRequest) => {
				return failure(req, HttpCodes.INTERNAL_SERVER_ERROR, error.message)
		  }
}

const onRequest = async (req: ServerRequest, controllers: Array<Function>) => {
	let controller

	try {
		if (!req.url || !req.method) {
			throw new InvalidRequestError()
		}

		controller = getController(req.url, controllers)
		const handler = getHandler(req.url, req.method, controller)

		const result = await handler(req)

		return success(req, result.status, result.data)
	} catch (error) {
		if (error instanceof InvalidRequestError) {
			return failure(req, HttpCodes.BAD_REQUEST, error.message)
		}

		if (
			error instanceof HandlerNotFoundError ||
			error instanceof ControllerNotFoundError
		) {
			return failure(req, HttpCodes.NOT_FOUND, error.message)
		}

		const errorHandler = getErrorHandler(controller)

		return errorHandler(error, req)
	}
}

const serveIt = () => {
	if (config.port === 443) {
		log.info(`Serving HTTPS on ${config.port}`)

		return serveTLS({
			port: config.port,
			hostname: config.hostname,
			certFile: config.tls!.cert,
			keyFile: config.tls!.key,
		})
	}

	log.info(`Serving HTTP on ${config.port}`)

	return serve({ port: config.port })
}

const setup = async (controllers: Array<Function>, constructor: Function) => {
	if (!constructor.prototype.onStart) {
		constructor.prototype.onStart = () => {
			log.info(`Listening on :${config.port}`)
		}
	}

	if (!constructor.prototype.onError) {
		constructor.prototype.onError = (error: Error) => {
			log.error(error)
		}
	}

	const server = serveIt()

	for await (const req of server) {
		onRequest(req, controllers)
	}

	constructor.prototype.onStart(config)
}

export const Server = (...controllers: Array<Function>) => {
	return (constructor: Function) => {
		setup(controllers, constructor)
	}
}
