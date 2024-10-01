import type { Client } from "@discordjs/core";
import { GatewayDispatchEvents } from "@discordjs/core";
import type { AsyncEventEmitterListenerForEvent } from "@vladfrangu/async_event_emitter";

export const name = GatewayDispatchEvents.Ready;
export const execute: AsyncEventEmitterListenerForEvent<Client, typeof name> = async () => { }