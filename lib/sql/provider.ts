export const get = async (pendingModel: Promise<any>) => {
    const model = await pendingModel
    return await model.findOne()
}

export const update = (_type: string) => {
    
}

export const create = async (pendingModel: Promise<any>, body: any) => {
    const model = await pendingModel
    
    await model.create(body)
}

export const remove = (_type: string) => {
    
}
