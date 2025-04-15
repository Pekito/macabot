import TelegramBot, { TelegramExecutionContext } from '@codebam/cf-workers-telegram-bot';

const SED_REGEX = /^s\/([^\/]+)\/([^\/]*)\/?([a-zA-Z]*)?$/
export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const bot = new TelegramBot(env.TELEGRAM_BOT_TOKEN);
		console.log("foi", env.TELEGRAM_BOT_TOKEN);
		await bot
			.on(':message', async function (context: TelegramExecutionContext) {
				switch (context.update_type) {
					case 'message':
						const message = context.update.message!;
						const sedText = message.text;
						const target = message.reply_to_message;
						if(!target?.text) return new Response();
						if(!sedText?.startsWith("s/")) return new Response();
						const sedResult = SED_REGEX.exec(sedText);
						if(!sedResult) return new Response();
						const [, pattern, replacer, flags] = sedResult;
						const regex = new RegExp(pattern, flags);
						const replacedText = target.text.replace(regex, replacer);
						await context.api.sendMessage(bot.api.href, {
							text: replacedText,
							parse_mode: '',
							chat_id: message.chat.id,
							reply_to_message_id: target.message_id
						})
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
