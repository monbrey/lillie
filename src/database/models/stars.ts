import type { Snowflake } from "discord-api-types/globals";
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
};

export async function getStarBySourceId(id: Snowflake) {
	const rows = await sql`
		select *
		from stars
		where message_id = ${id}
	`;

	if (rows.length > 1) {
		throw new Error("Too many rows returned.");
	}

	return rows.length ? rows[0] as Star : null;
}

export async function getStarByStarId(id: Snowflake) {
	const rows = await sql`
		select *
		from stars
		where board_message_id = ${id}
	`;

	if (rows.length > 1) {
		throw new Error("Too many rows returned.");
	}

	return rows.length ? rows[0] : null;
}

export async function createStar(star: Star) {
	const rows = await sql`
		insert into stars
		${sql(star)} 
		returning *
	`;

	if (rows.length > 1) {
		throw new Error("Too many rows returned.");
	}

	return rows.length ? rows[0] : null;
}

export async function deleteStarBySourceId(id: Snowflake) {
	return sql`
		delete from stars 
		where message_id = ${id}
	`;
}

export async function updateScoreForStar(id: Snowflake, score: number) {
	const rows = await sql`
		update stars 
		set score = ${score}
		where message_id = ${id}
		returning *
	`;

	return rows.length ? rows[0] as Star : null;
}

export async function updatePremiumScoreForStar(id: Snowflake, score: number) {
	const rows = await sql`
		update stars 
		set premium_score = ${score}
		where message_id = ${id}
		returning *
	`;

	return rows.length ? rows[0] as Star : null;
}

export async function getTopStarsForGuild(guild_id: Snowflake): Promise<Star[]> {
	return sql`
		select *
		from stars
		where guild_id = ${guild_id}
		order by score desc
		limit 10
	`;
}

export async function getTopAuthorsForGuild(guild_id: Snowflake): Promise<Star[]> {
	return sql`
		select author_id, sum(score) as score
		from stars
		where guild_id = ${guild_id}
		group by author_id
		order by score desc
		limit 10
	`;
}
