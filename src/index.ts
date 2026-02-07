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
								const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd', {
									headers: { 'User-Agent': 'macabot/1.0' },
								});
								const data = await res.json() as { bitcoin: { usd: number } };
								console.log("Bitcoin Request", data);
								const price = data.bitcoin.usd.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
								await reply_to(context, `Bitcoin: ${price}`, message.message_id);
							} catch (error) {
								console.error(error);
								await reply_to(context, 'Failed to fetch Bitcoin price.', message.message_id);
							}
							break;
						}

						if (text?.toLowerCase().startsWith('/macagrok ')) {
							const userMessage = text.substring('/macagrok '.length).trim();
							if (!userMessage) break;

							try {
								const messages: { role: string; content: string }[] = [
									{
										role: 'system',
										content: 'You are Macagrok, a bot in a Telegram group chat. Keep your responses short and concise — prefer a few sentences over long paragraphs. Never use more than 100 words. Only give longer answers when explicitly required by the user. Do not user Markdown notation',
									},
								];

								const replyText = message.reply_to_message?.text;
								if (replyText) {
									messages.push({ role: 'user', content: `Context from a previous message:\n${replyText}` });
								}

								messages.push({ role: 'user', content: userMessage });

								const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
									method: 'POST',
									headers: {
										'Authorization': `Bearer ${env.OPENROUTER_API_KEY}`,
										'Content-Type': 'application/json',
									},
									body: JSON.stringify({
										model: 'openai/gpt-4o-mini-search-preview',
										plugins: [{ id: 'web', max_results: 5 }],
										messages,
									}),
								});

								const data = await res.json() as { choices: { message: { content: string } }[] };
								const reply = data.choices?.[0]?.message?.content;
								if (!reply) throw new Error('No response from model');

								await reply_to(context, reply, message.message_id);
							} catch (error) {
								console.error(error);
								await reply_to(context, 'Failed to get a response from Macagrok.', message.message_id);
							}
							break;
						}

						if (text?.toLowerCase() === '/macabot usd') {
							try {
								const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=tether&vs_currencies=brl', {
									headers: { 'User-Agent': 'macabot/1.0' },
								});
								const data = await res.json() as { tether: { brl: number } };
								console.log("USDT Request", data);
								const price = data.tether.brl.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
								await reply_to(context, `USDT: ${price}`, message.message_id);
							} catch (error) {
								console.error(error);
								await reply_to(context, 'Failed to fetch USDT price.', message.message_id);
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
