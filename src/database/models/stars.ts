import type { Snowflake } from "discord-api-types/globals.js";

export type Star = {
	author_id: Snowflake;
	board_channel_id: Snowflake;
	board_message_id: Snowflake;
	channel_id: Snowflake;
	guild_id: Snowflake;
	id: Snowflake;
	premium_score: number;
	score: number;
}