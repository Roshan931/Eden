import * as log from 'https://deno.land/std/log/mod.ts'

import { Puppy } from '../models/puppy.ts'
import { Controller } from '../../lib/decorators/controller.ts'
import { Get, Post } from '../../lib/decorators/router.ts'

@Controller({
	baseUrl: '/puppy',
})
export class PuppyC {
	@Get('/:id')
	async getPuppy(id: string): Promise<Puppy[]> {
		const puppies = await Puppy.prototype.get({
			id,
		})

		log.info(`Some cute puppies: ${puppies}`)

		return puppies ?? []
	}

	@Get('/')
	async getAllPuppies(): Promise<Puppy[]> {
		const puppies = await Puppy.prototype.getAll()

		log.info(`Some cute puppies: ${puppies}`)

		return puppies ?? []
	}

	@Post('/')
	async adoptPuppy(puppy: Record<string, unknown>): Promise<string> {
		await Puppy.prototype.create(puppy)

		return 'Adopted cute puppy'
	}
}
