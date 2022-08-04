import { ServerRequest } from 'https://deno.land/std@0.78.0/http/server.ts'
import * as log from 'https://deno.land/std/log/mod.ts'

import { getPathsCombined } from '../utils.ts'
import { assert } from 'https://deno.land/std@0.78.0/_util/assert.ts'

// TODO: Add Deno support for nvim
const logResponse = (
	method: string,
	path: string,
	status: number,
	payload?: any,
) => {
	if (payload) {
		log.info(
			`[${method} ${path}] Pero responded with status ${status} and payload ${JSON.stringify(
				payload,
			)}`,
		)
	} else {
		log.info(`[${method} ${path}] Pero responded with status ${status}`)
	}
}

type Script = 'get' | 'put' | 'post' | 'delete' | 'view'

// TODO: Add correct typings
type Viewer = (req: any) => Promise<any>
type DecoratorFunc = (
	target: any,
	_key: string | symbol,
	descriptor: PropertyDescriptor,
) => PropertyDescriptor

interface Credits {
	status: number
	data?: any
	script: Script
}

class Scene {
	script!: Script
	path!: string
	viewer!: Viewer

	constructor(script: Script, path: string) {
		this.script = script
		this.path = path
	}

	public static init(script: Script, path: string): DecoratorFunc {
		const scene = new Scene(script, path)

		return (
			audience: any,
			_key: string | symbol,
			descriptor: PropertyDescriptor,
		): PropertyDescriptor => {
			scene.viewer = descriptor.value
			audience = scene.watchWith(audience)

			return descriptor
		}
	}

	private watchWith(audience: any): any {
		return (audience[this.script + getPathsCombined(this.path)] = this.act.bind(
			this,
		))
	}

	private async act(req: ServerRequest): Promise<Credits> {
		if (!req) {
			throw new Error(`Acting on wrong act with the script ${this.script}`)
		}

		try {
			const result = await this.viewer.call(this.viewer, {
				...req,
				body: await this.toJSON(req.body),
			})

			this.log(200, result)

			return {
				status: 200,
				data: result,
				script: this.script,
			}
		} catch (error) {
			log.error(error)

			this.log(500)

			return {
				status: 500,
				script: this.script,
			}
		}
	}

	log(status: number, data?: any): void {
		logResponse(this.script, this.path, status, data)
	}

	async toJSON(body: any | undefined): Promise<any> {
		if (!body || body === '') return {}

		const decoder = new TextDecoder()

		assert(body)

		try {
			const json = JSON.parse(decoder.decode(await Deno.readAll(body)))

			assert(json)

			return json
		} catch (error) {
			if (this.script === 'post' || this.script === 'put') {
				log.error('Whoops, could not parse the body o_O')
			}

			return {}
		}
	}
}

export const View = (path: string) => Scene.init('view', path)
export const Get = (path: string) => Scene.init('get', path)
export const Put = (path: string) => Scene.init('put', path)
export const Post = (path: string) => Scene.init('post', path)
export const Delete = (path: string) => Scene.init('delete', path)
