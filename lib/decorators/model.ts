import { ModelTypes } from '../../definitions.ts'

const keywords = [ 'get', 'update', 'create', 'remove' ]

type IHandler = {
    toModel(constructor: Function): any
    get: Function
    update: Function
    create: Function
    remove: Function
}

const getDriver = async (type: ModelTypes): Promise<IHandler> => {
    const driver = await import(`../${type.toString().toLowerCase()}/index.ts`)
    
    return {
        toModel: async (constructor: any) => {
            const instance = new constructor()
            const props = Object.getOwnPropertyNames(instance)
                .filter(p => keywords.indexOf(p) < 0)
                .map(p => ({ key: p, type: typeof instance[p] }))

            return await driver.toModel(constructor.name, props)
        },
        get: driver.get,
        remove: driver.remove,
        create: driver.create,
        update: driver.update,
    }
}

type Options = {
    overwrite: true
}

const setup = async (type: ModelTypes, constructor: Function) => {
    const driver: IHandler = await getDriver(type)

    const model = driver.toModel(constructor)

    constructor.prototype.type = type

    constructor.prototype.get = async () => await driver.get.call(driver.get, model)
    constructor.prototype.update = async () => await driver.update.call(driver.update, model)
    constructor.prototype.create = async (body: any, options: Options) => await driver.create.call(driver.create, model, body, options)
    constructor.prototype.remove = async () => await driver.remove.call(driver.remove, model)
}

export const Model = (type: ModelTypes) => {
    return (constructor: Function) => {
        setup(type, constructor)
    }
}
