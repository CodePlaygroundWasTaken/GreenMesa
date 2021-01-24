import { Client, Collection, DMChannel, Message, TextChannel } from "discord.js";
import { DBManager } from "./dbmanager";
import Specials from "./utils/specials";

export interface XClient extends Client {
    commands?: Collection<string, Command>;
    categories?: Collection<string, Category>;
    gprefix?: string;
    specials?: typeof Specials;
    db?: DBManager;
}

export interface Command {
    name: string;
    aliases?: string[];
    description?: string | {
        short: string,
        long: string
    }
    category?: string;
    usage?: string;
    args?: boolean;
    specialArgs?: number;
    permLevel?: number;
    guildOnly?: boolean;
    ownerOnly?: boolean;
}

export interface Category {
    name: string;
    id: number;
    count: number;
    emoji?: string;
}

/*export interface ClientSpecials {// NOT USING, JUST DID typeof
    sendModerationDisabled(channel: SendableChannel): Promise<void>;
    sendError(channel: SendableChannel, message: string, errorTitle = false): Promise<void>;
    argsNumRequire(channel: SendableChannel, args: string[], num: number): Promise<boolean>;
    argsMustBeNum(channel: SendableChannel, args: string[]): Promise<boolean>;
}*/

//export type SendableChannel = TextChannel & DMChannel;
export interface SendableChannel extends TextChannel, DMChannel { }

export interface GSRow {
    name?: string;
    value?: string;
    previousvalue?: string;
    description?: string;
    lastupdated?: string;
    updatedby?: string;
    category?: string;
}

export interface SSRow {
    id?: string;

}

export interface ExpRow {
    id?: string;
    userid?: string;
    guildid?: string;
    timeAdded?: timestamp;
    timeUpdated?: timestamp;
    xp?: number;
    level?: number;
    spideySaved?: string;
}

export interface LevelRow {
    id?: string;
    guildid?: string;
    roleid?: string;
    level?: number;
}

export interface BSRow {
    updatedId?: number;
    logDate?: string;
    numUsers?: number;
    numGuilds?: number;
    numChannels?: number;
}

export interface XMessage extends Message {
    gprefix?: string;
}
