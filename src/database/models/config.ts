import type { Snowflake } from "discord-api-types/globals.js";
import { sql } from "../index.js";

export type Config = {
	board_channel_id: Snowflake;
	board_emoji: string;
	board_threshold: number;
	guild_id: Snowflake;
	premium_channel_id: Snowflake;
	premium_emoji: string;
	premium_threshold: number;
}

export async function getConfigForGuild(guild_id: Snowflake) {
	const rows = await sql`
		select *
		from config
		where guild_id = ${guild_id}
	`;

	if(rows.length > 1) throw new Error("Too many rows returned.");
	return rows[0] as Config;
}

export async function createConfigForGuild(config: Partial<Config> & { guild_id: Snowflake }) {
	return sql`
		insert into config 
		${sql(config)} 
		on conflict (guild_id) 
		do nothing 
		returning *
	`
}

export async function updateConfigForGuild(config: Partial<Config> & { guild_id: Snowflake }) {
	return sql`
		update config 
		set ${sql(config)} 
		where guild_id = ${config.guild_id}
		returning *
	`
}

export async function upsertConfigForGuild(config: Partial<Config> & { guild_id: Snowflake }) {
	return sql`
		insert into config
		${sql(config)}
		on conflict (guild_id) do update
		set ${sql(config)}
		returning *
	`
}