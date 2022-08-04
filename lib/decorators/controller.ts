interface IControllerConfig {
	baseUrl: String
}

export const Controller = (config: IControllerConfig) => {
	return (constructor: Function) => {
		constructor.prototype.baseUrl = config.baseUrl
	}
}
