import TelegramBot, { TelegramExecutionContext } from '@codebam/cf-workers-telegram-bot';
import { sed } from 'sed-lite';
import { reply_to } from './utils';
const SLASH_COUNT_REGEX = /(?<!\\)\//g;
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
							const matches = sedText.match(SLASH_COUNT_REGEX);
							const slashCount = matches ? matches.length : 0;
							const validSedtext = slashCount > 2 ? sedText : sedText + "/"
							const sedTransform = sed(validSedtext);
							const replacedText = sedTransform(target.text);
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
