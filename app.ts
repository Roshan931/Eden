import * as log from 'https://deno.land/std/log/mod.ts'

import { Server, Model, MozModel, ModelTypes } from './index.ts'
import { ServerConfig } from './definitions.ts'
import {
    Controller,
} from './lib/decorators/controller.ts'
import {
    Get,
    Post
} from './lib/decorators/router.ts'

@Model(ModelTypes.MONGO)
export class Human extends MozModel {
    name: string = ''
}

@Controller({
    baseUrl: '/human'
})
class HumanController {
    @Get('/')
    async getHuman() {
        const human = await Human.prototype.get()
        return human ?? {}
    }

    @Post('/')
    async addHuman(body: any) {
        await Human.prototype.create(body, { overwrite: true })

        return 'Added human'
    }
}

@Server(HumanController)
class App {
    onStart(config: ServerConfig) {
        log.info(`Server is listening on :${config.port}`)
    }

    onStop() {
        log.info('Server stopped')
        Deno.exit(1)
    }

    onError(error: Error) {
        throw error
    }
}

new App()
