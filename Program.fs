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


let SED_REGEX = Regex @"^s\/([^\/]+)\/([^\/]*)\/?([a-zA-Z]*)?$"
let applySed (input: string) (sedCommand: string) =
    let m = SED_REGEX.Match(sedCommand)
    if m.Success then
        let search = m.Groups.[1].Value
        let replace = m.Groups.[2].Value
        let flags = m.Groups.[3].Value
        let options = 
            let mutable options = RegexOptions.None
            if flags.Contains("i") then options <- options ||| RegexOptions.IgnoreCase
            if flags.Contains("m") then options <- options ||| RegexOptions.Multiline
            if flags.Contains("s") then options <- options ||| RegexOptions.Singleline
            if flags.Contains("x") then options <- options ||| RegexOptions.IgnorePatternWhitespace
            options
        let regex = Regex(search, options)
        if flags.Contains "g" then regex.Replace(input, replace)
        else regex.Replace(input, replace, 1)
        
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

let poorlyMentioned (message: Types.Message) =
  match message.Text with
  | Some text -> 
    text.Contains("poorly", System.StringComparison.OrdinalIgnoreCase) && 
    not (text.Contains("banido pelo macabeus", System.StringComparison.OrdinalIgnoreCase))
  | _ -> false

let updateArrived (ctx: UpdateContext) =
    processCommands ctx [|
      cmd "/ranking" (fun _ -> printfn "Chamou /ranking")
    |] |> ignore
    let sendRequest req = 
      api ctx.Config req |> Async.Ignore |> Async.Start
    match ctx.Update.Message with
        | Some message ->
          let isSed, replaced = isMessageSedReplace message
          if isSed then sendRequest (Api.sendMessageReply message.Chat.Id replaced message.ReplyToMessage.Value.MessageId)
          else if poorlyMentioned message then sendRequest (Api.sendMessageReply message.Chat.Id "Poorly foi banido pelo Macabeus." message.MessageId)
          
        | _ -> ()

[<EntryPoint>]
let main _ =
  async {
    let config = Config.defaultConfig |> Config.withReadTokenFromEnv "TELEGRAM_BOT_TOKEN"
    let! _ = Api.deleteWebhookBase () |> api config
    return! startBot config updateArrived None
  } |> Async.RunSynchronously
  0