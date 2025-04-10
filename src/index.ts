import TelegramBot, { TelegramExecutionContext } from '@codebam/cf-workers-telegram-bot';
export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const bot = new TelegramBot(env.TELEGRAM_BOT_TOKEN);
		console.log("foi", env.TELEGRAM_BOT_TOKEN);
		await bot
			.on(':message', async function (context: TelegramExecutionContext) {
				switch (context.update_type) {
					case 'message':
						await context.reply('Hello from Cloudflare workers');
						break;

					default:
						break;
				}
				return new Response('ok');
			})
			.handle(request.clone());
		return new Response('ok');
	},
};
