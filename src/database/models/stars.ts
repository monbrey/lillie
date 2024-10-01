import type { Snowflake } from "discord-api-types/globals.js";
import { sql } from "../index.js";

export type Star = {
	author_id: Snowflake;
	board_channel_id: Snowflake;
	board_message_id: Snowflake;
	channel_id: Snowflake;
	guild_id: Snowflake;
	message_id: Snowflake;
	premium_score: number;
	score: number;
}

export async function getStarBySourceId(id: Snowflake) {
	const rows = await sql`
		select *
		from stars
		where message_id = ${id}
	`;

	if (rows.length > 1) throw new Error("Too many rows returned.");
	return rows.length ? rows[0] as Star : null;
}

export async function getStarByStarId(id: Snowflake) {
	const rows = await sql`
		select *
		from stars
		where board_message_id = ${id}
	`;

	if (rows.length > 1) throw new Error("Too many rows returned.");
	return rows.length ? rows[0] : null;
}

export async function createStar(star: Star) {
	const rows = await sql`
		insert into stars 
		${sql(star)} 
		returning *
	`;

	if (rows.length > 1) throw new Error("Too many rows returned.");
	return rows.length ? rows[0] : null;
}

export async function deleteStarBySourceId(id: Snowflake) {
	return sql`
		delete from stars 
		where message_id = ${id}
	`;
}

export async function incrementScoreForStar(id: Snowflake, premium: boolean) {
	const col = premium ? 'premium_score' : 'score';

	const rows = await sql`
		update stars 
		set ${col} = ${col} + 1
		where message_id = ${id}
		returning *
	`;

	if (rows.length > 1) throw new Error("Too many rows returned.");
	return rows.length ? rows[0] : null;
}

export async function decrementScoreForStar(id: Snowflake, premium: boolean) {
	const col = premium ? 'premium_score' : 'score';

	const rows = await sql`
		update stars 
		set ${col} = ${col} - 1
		where message_id = ${id}
		returning *
	`;

	if (rows.length > 1) throw new Error("Too many rows returned.");
	return rows.length ? rows[0] : null;
}