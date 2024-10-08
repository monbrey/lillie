import type { Snowflake } from "discord-api-types/globals";
import { sql } from "../index.js";

export type Gold = {
	timestamp: number;
	user_id: Snowflake;
};

export async function insertGoldForUser(id: Snowflake) {
	const rows = await sql`
		insert into golds 
		${sql({
		user_id: id,
		timestamp: Date.now(),
	})} 
		returning *
	`;

	if (rows.length > 1) {
		throw new Error("Too many rows returned.");
	}

	return rows.length ? rows[0] as Gold : null;
}

export async function getLastGoldsForUser(id: Snowflake, limit: number = 1): Promise<Gold[]> {
	return sql`
		select *
		from golds
		where user_id = ${id}
		order by timestamp desc
		limit ${limit}
	`;
}
