// Generated by Wrangler by running `wrangler types --include-runtime=false` (hash: 187132f48ddf0f604882ba8213fe386f)
declare namespace Cloudflare {
	interface Env {
		ASSETS: Fetcher;
	}
}
interface Env extends Cloudflare.Env {
	TELEGRAM_BOT_TOKEN: string
}
