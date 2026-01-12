import TelegramBot, { TelegramExecutionContext } from '@codebam/cf-workers-telegram-bot';
import { sed } from 'sed-lite';
export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const bot = new TelegramBot(env.TELEGRAM_BOT_TOKEN);
		await bot
			.on(':message', async function (context: TelegramExecutionContext) {
				switch (context.update_type) {
					case 'message':
						const message = context.update.message!;
						const sedText = message.text;
						const target = message.reply_to_message;
						if(!target?.text) return new Response();
						if(!sedText?.startsWith("s/")) return new Response();
						try {
							const sedTransform = sed(sedText);
							const replacedText = sedTransform(target.text);
							await context.reply(replacedText);
						} catch (error) {
							// Invalid sed syntax, ignore
							return new Response();
						}
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
