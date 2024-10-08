import type { Snowflake } from "discord-api-types/globals.js";
import { sql } from "../index.js";

export type Config = {
	gold_channel_id?: Snowflake;
	gold_emoji?: string;
	gold_threshold: number;
	guild_id: Snowflake;
	standard_channel_id?: Snowflake;
	standard_emoji?: string;
	standard_threshold: number;
};

export type PartialConfig = Partial<Config> & { guild_id: Snowflake; };

export async function getConfigForGuild(guild_id: Snowflake) {
	const rows = await sql`
		select *
		from config
		where guild_id = ${guild_id}
	`;

	if (rows.length > 1) {
		throw new Error("Too many rows returned.");
	}

	return rows.length ? rows[0] as Config : null;
}

export async function createConfigForGuild(config: PartialConfig) {
	const rows = await sql`
		insert into config 
		${sql(config)} 
		on conflict (guild_id) 
		do nothing 
		returning *
	`;

	if (rows.length > 1) {
		throw new Error("Too many rows returned.");
	}

	return rows.length ? rows[0] as Config : null;
}

export async function updateConfigForGuild(config: Partial<Config> & { guild_id: Snowflake; }) {
	const rows = await sql`
		update config 
		set ${sql(config)} 
		where guild_id = ${config.guild_id}
		returning *
	`;

	if (rows.length > 1) {
		throw new Error("Too many rows returned.");
	}

	return rows.length ? rows[0] as Config : null;
}

export async function upsertConfigForGuild(config: Partial<Config> & { guild_id: Snowflake; }): Promise<Config[]> {
	return sql`
		insert into config
		${sql(config)}
		on conflict (guild_id) do update
		set ${sql(config)}
		returning *
	`;
}
