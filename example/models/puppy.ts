import { Model, MozModel, ModelTypes } from '../../index.ts'

@Model(ModelTypes.MONGO)
export class Puppy extends MozModel {
	id: string = ''
	name: string = ''
}
