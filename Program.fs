open Funogram.Api
open Funogram.Telegram
open Funogram.Telegram.Bot
open dotenv.net
open System.Text.RegularExpressions

type BotCommand = {
    Name: string;
    Arguments: string
}
DotEnv.Load() |> ignore


let SED_REGEX = Regex @"^s\/(.*?)\/(.*)?"
let applySed (input: string) (sedCommand: string) =
    let m = SED_REGEX.Match(sedCommand)
    if m.Success then
        let search = m.Groups.[1].Value
        let replace = m.Groups.[2].Value
        input.Replace(search, replace)
    else
        ""

let isUserBot (userOption: Types.User option) =
  match userOption with
  | Some userOption -> userOption.IsBot
  | _ -> false
let isMessageSedReplace (message: Types.Message) =
  
    match message.ReplyToMessage, message.Text with
    | Some reply, Some text ->
      let isReplace = SED_REGEX.IsMatch text && not (isUserBot reply.From)
      isReplace, applySed reply.Text.Value text
      
    | _ -> false, ""


let updateArrived (ctx: UpdateContext) =
    processCommands ctx [|
      cmd "/ranking" (fun _ -> printfn "Chamou /ranking")
    |] |> ignore
    let sendRequest req = 
      api ctx.Config req |> Async.Ignore |> Async.Start
    match ctx.Update.Message with
        | Some message ->
          let isSed, replaced = isMessageSedReplace message
          printfn "%A %A" isSed replaced
          if isSed then sendRequest (Api.sendMessageReply message.Chat.Id replaced message.ReplyToMessage.Value.MessageId)
          
        | _ -> ()

[<EntryPoint>]
let main _ =
  async {
    let config = Config.defaultConfig |> Config.withReadTokenFromEnv "TELEGRAM_BOT_TOKEN"
    let! _ = Api.deleteWebhookBase () |> api config
    return! startBot config updateArrived None
  } |> Async.RunSynchronously
  0