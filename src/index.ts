import TelegramBot, { TelegramExecutionContext } from '@codebam/cf-workers-telegram-bot';
import { applySedTransform } from './sed-transform';
import { reply_to } from './utils';

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const bot = new TelegramBot(env.TELEGRAM_BOT_TOKEN);
		await bot
			.on(':message', async function (context: TelegramExecutionContext) {
				switch (context.update_type) {
					case 'message':
						const message = context.update.message!;
						const text = message.text;

						if (text?.toLowerCase() === '/macabot bitcoin') {
							try {
								const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd');
								const data = await res.json() as { bitcoin: { usd: number } };
								const price = data.bitcoin.usd.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
								await reply_to(context, `Bitcoin: ${price}`, message.message_id);
							} catch (error) {
								console.error(error);
								await reply_to(context, 'Failed to fetch Bitcoin price.', message.message_id);
							}
							break;
						}

						const sedText = text;
						const target = message.reply_to_message;
						if(!target?.text) return new Response();
						if(!sedText?.startsWith("s/")) return new Response();
						try {
							const replacedText = applySedTransform(sedText, target.text);
							await reply_to(context, replacedText, target.message_id)
						} catch (error) {
							console.error(error)
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
