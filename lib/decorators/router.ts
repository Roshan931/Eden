import { Request } from 'https://deno.land/x/oak/mod.ts'
import * as log from 'https://deno.land/std/log/mod.ts'

import { getPathsCombined } from '../utils.ts'

const logResponse = (method: string, path: string, status: number, payload?: any) => {
    if (payload) {
        log.info(`[${method} ${path}] Pero responded with status ${status} and payload ${JSON.stringify(payload)}`)
    } else {
        log.info(`[${method} ${path}] Pero responded with status ${status}`)
    }
}

export const View = (path: string) => {
    return (target: any, _key: string | symbol, descriptor: PropertyDescriptor) => {
        const original: Function = descriptor.value

        target[`view${getPathsCombined(path)}`] = async (req: Request) => {
            const result = await original.call(original, req)

            return {
                status: 200,
                data: result,
                type: 'view'
            }
        }

        return descriptor
    }
}

export const Get = (path: string) => {
    return (target: any, _key: string | symbol, descriptor: PropertyDescriptor) => {
        const original: Function = descriptor.value

        target[`get${getPathsCombined(path)}`] = async (req: Request) => {
            try {
                const result = await original.call(original, req)

                logResponse('GET', path, 200, result)

                return {
                    status: 200,
                    data: result
                }
            } catch (error) {
                log.error(error)

                logResponse('GET', path, 500)

                return {
                    status: 500
                }
            }
        }

        return descriptor
    }
}

export const Post = (path: string) => {
    return (target: any, _key: string | symbol, descriptor: PropertyDescriptor) => {
        const original: Function = descriptor.value

        target[`post${getPathsCombined(path)}`] = async (req: Request) => {
            try {
                const body = await req.body({ type: 'json' }).value
                const result = await original.call(original, body)

                logResponse('POST', path, 200, result)

                return {
                    status: 200,
                    data: result
                }
            } catch (error) {
                log.error(error)

                logResponse('POST', path, 500)

                return {
                    status: 500
                }
            }
        }

        return descriptor
    }
}

export const Put = (path: string) => {
    return (target: any, _key: string | symbol, descriptor: PropertyDescriptor) => {
        const original: Function = descriptor.value

        target[`put${getPathsCombined(path)}`] = async (req: Request) => {
            const body = await req.body({ type: 'json' }).value
            const result = await original.call(original, body)

            log.info(`Pero responded with status 200 and payload ${JSON.stringify(result)}`)

            return {
                status: 200,
                data: result
            }
        }

        return descriptor
    }
}

export const Delete = (path: string) => {
    return (target: any, _key: string | symbol, descriptor: PropertyDescriptor) => {
        const original: Function = descriptor.value

        target[`delete${getPathsCombined(path)}`] = async (req: Request) => {
            const result = await original.call(original, req)

            return {
                status: 200,
                data: result
            }
        }

        return descriptor
    }
}
