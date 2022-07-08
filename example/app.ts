import * as log from 'https://deno.land/std/log/mod.ts'

import { Server } from '../index.ts'
import { PuppyC } from './controllers/puppy.c.ts'

@Server(PuppyC)
class Pawsome {
	onStart(port: number) {
		log.info(`Pawsome server started on :${port}...`)
	}

	onClose(code: number) {
		log.info(`Pawsome exited with code [${code}]...`)
	}

	onError(error: Error) {
		log.error(`Oops, ${error.message}`)
	}
}

new Pawsome()
