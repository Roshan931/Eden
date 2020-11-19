import { Application, Request, Response } from 'https://deno.land/x/oak/mod.ts'
import * as log from 'https://deno.land/std/log/mod.ts'

import { HttpCodes } from '../../definitions.ts'
import { 
    getBase, 
    getPathsCombined,
    capitalize,
    success,
    failure
} from '../utils.ts'
import { 
    ControllerNotFoundError, 
    HandlerNotFoundError, 
    InvalidRequestError 
} from '../errors.ts'
import config from '../../config.ts'

const getController = (url: string, controllers: Array<Function>): Function => {
    const base = getBase(url)
    const controller = controllers.find(c => c.prototype.baseUrl === base)

    if (!controller) {
        throw new ControllerNotFoundError()
    }

    return controller
}

const getHandler = (url: string, method: string, controller: Function): Function => {
    const base = getBase(url)
    const childPaths = getPathsCombined(url).replace(capitalize(base.substr(1, base.length - 1)), '')
    const handler = controller.prototype[method.toLowerCase() + childPaths]

    if (!handler || !handler.call) {
        throw new HandlerNotFoundError()
    }

    return handler
}

const getErrorHandler = (controller: Function | undefined): Function => {
    return controller ? controller.prototype['onError']
        : (error: any, res: Response) => {
            return failure(res, HttpCodes.INTERNAL_SERVER_ERROR, error.message)
        }
}

const onRequest = async (req: Request, res: Response, controllers: Array<Function>) => {
    let controller

    try {
        if (!req.url || !req.method) {
            throw new InvalidRequestError()
        }

        controller = getController(req.url.pathname, controllers)
        const handler = getHandler(req.url.pathname, req.method, controller)

        const result = await handler(req)
        
        return success(res, result)
    } catch (error) {
        if (error instanceof InvalidRequestError) {
            return failure(res, HttpCodes.BAD_REQUEST, error.message)    
        }

        if (error instanceof HandlerNotFoundError || error instanceof ControllerNotFoundError) {
            return failure(res, HttpCodes.NOT_FOUND, error.message)
        }

        const errorHandler = getErrorHandler(controller)

        return errorHandler(error, res)
    }
}

const setup = async (controllers: Array<Function>, constructor: Function) => {
    const app = new Application()

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

    app.use(ctx => onRequest(ctx.request, ctx.response, controllers))
    
    app.addEventListener('error', constructor.prototype.onError)

    await app.listen({ port: config.port! })

    constructor.prototype.onStart(config)
}

export const Server = (...controllers: Array<Function>) => {
    return (constructor: Function) => {
        setup(controllers, constructor)
    }
}
