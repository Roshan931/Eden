import * as log from 'https://deno.land/std/log/mod.ts'

import { Server, Model, MozModel, ModelTypes } from '../index.ts'
import { Controller } from '../lib/decorators/controller.ts'
import { Get, Post } from '../lib/decorators/router.ts'

@Model(ModelTypes.MONGO)
export class Human extends MozModel {
	name: string = ''
}

@Controller({
	baseUrl: '/human',
})
class HumanController {
	@Get('/')
	async getHuman(): Promise<Human> {
		const human = await Human.prototype.get()

		log.info(`Some strange human: ${human}`)

		return human ?? {}
	}

	@Post('/')
	async addHuman(body: any): Promise<string> {
		await Human.prototype.create(body, { overwrite: true })

		return 'Added human'
	}
}

@Server(HumanController)
class App {
	onStart(port: number) {
		log.info(`Server started on :${port}...`)
	}

	onClose(code: number) {
		log.info(`Exited with code [${code}]...`)
	}

	onError(error: Error) {
		log.error(`Oops, ${error.message}`)
	}
}

new App()
