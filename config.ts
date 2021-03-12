import { ServerConfig } from './definitions.ts'
import { config } from 'https://deno.land/x/dotenv/mod.ts'

config({
	allowEmptyValues: false,
	export: true,
})

export default <ServerConfig>{
	port: parseInt(Deno.env.get('PORT') ?? '3333'),
	redis_port: parseInt(Deno.env.get('REDIS_PORT') ?? '6379'),
	database: {
		mongo: {
			hostname: Deno.env.get('MONGO_HOSTNAME') ?? 'localhost',
			port: parseInt(Deno.env.get('MONGO_PORT') ?? '27017'),
			database: Deno.env.get('MONGO_DATABASE') ?? 'database',
		},
		sql: {
			hostname: Deno.env.get('SQL_HOSTNAME') ?? 'localhost',
			database: Deno.env.get('SQL_DATABASE') ?? 'database',
			user: Deno.env.get('SQL_USER') ?? 'user',
			password: Deno.env.get('SQL_PASSWORD') ?? 'password',
		},
	},
}
