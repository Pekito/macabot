import { TelegramExecutionContext } from "@codebam/cf-workers-telegram-bot";
import { convert } from "telegram-markdown-v2";

export function getChatId(context: TelegramExecutionContext) {
    if (context.update.message?.chat.id) {
      return context.update.message.chat.id.toString();
    } else if (context.update.business_message?.chat.id) {
      return context.update.business_message.chat.id.toString();
    }
    return '';
}
export function getMessageId(context: TelegramExecutionContext) {
    return context.update.message?.message_id.toString() ?? '';
}
  /**
   * Reply to the last message with text
   * @param message - text to reply with
   * @param parse_mode - one of HTML, MarkdownV2, Markdown, or an empty string for ascii
   * @param options - any additional options to pass to sendMessage
   * @returns Promise with the API response
   */
  export async function reply_to(context: TelegramExecutionContext, message: string, message_to_reply_id: string | number, parse_mode = '', options: Record<string, number | string | boolean> = {}) {
    if(parse_mode === "MarkdownV2") message = convert(message);
    switch (context.update_type) {
      case 'message':
      case 'photo':
      case 'document':
        return await context.api.sendMessage(context.bot.api.toString(), {
          ...options,
          chat_id: getChatId(context),
          reply_to_message_id: message_to_reply_id,
          text: message,
          parse_mode,
        });
      case 'business_message':
        return await context.api.sendMessage(context.bot.api.toString(), {
          chat_id: getChatId(context),
          text: message,
          business_connection_id: context.update.business_message?.business_connection_id.toString() ?? '',
          parse_mode,
        });
      case 'callback':
        if (context.update.callback_query?.message.chat.id) {
          return await context.api.sendMessage(context.bot.api.toString(), {
            ...options,
            chat_id: context.update.callback_query.message.chat.id.toString(),
            text: message,
            parse_mode,
          });
        }
        return null;
      case 'inline':
        return await context.replyInline('Response', message, parse_mode);
      default:
        return null;
    }
  }