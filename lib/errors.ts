export class ControllerNotFoundError extends Error {
    message: string = 'Controller not found'
}

export class HandlerNotFoundError extends Error {
    message: string = 'Handler not found'
}

export class InvalidRequestError extends Error {
    message: string = 'Request properties are invalid'
}
