import { Client, Collection, Message } from "discord.js";
import { DBManager } from "./dbmanager";
import * as Specials from "./utils/specials";
import DiscordStrategy from 'passport-discord';
import { MessageServices } from "./services";

export interface XClient extends Client {
    commands?: Collection<string, Command>;
    categories?: Collection<string, Category>;
    gprefix?: string;
    specials?: typeof Specials;
    database?: DBManager;
    services?: MessageServices;
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
    cooldown?: number;
    permLevel?: number;
    moderation?: boolean;
    guildOnly?: boolean;
    ownerOnly?: boolean;
    execute(client: XClient, message: XMessage, args: string[]): Promise<void | boolean>;
}

export interface RCommand extends Command {
    category: string;
}

export interface Category {
    name: string;
    id: number;
    count: number;
    emoji?: string;
    commands: Command[];
}

/*export interface ClientSpecials {// NOT USING, JUST DID typeof
    sendModerationDisabled(channel: SendableChannel): Promise<void>;
    sendError(channel: SendableChannel, message: string, errorTitle = false): Promise<void>;
    argsNumRequire(channel: SendableChannel, args: string[], num: number): Promise<boolean>;
    argsMustBeNum(channel: SendableChannel, args: string[]): Promise<boolean>;
}*/

//export type SendableChannel = TextChannel & DMChannel;

//export interface SendableChannel extends TextChannel, DMChannel { }

export interface GlobalSettingRow {
    name: string;
    value: string;
    previousvalue?: string;
    description?: string;
    lastupdated?: string;
    updatedby: string;
    category?: string;
}

export interface SSRow {
    id?: string;

}

export interface ExpRow {
    id: string;
    userid: string;
    guildid: string;
    timeAdded: timestamp;
    timeUpdated: timestamp;
    xp: number;
    level: number;
    spideySaved: string;
}

export interface PersonalExpRow extends ExpRow {
    rank: number;
}

/*export interface LevelRow {
    id?: string;
    guildid?: string;
    roleid?: string;
    level?: number;
}*/

export interface LevelRolesRow {
    id: string;
    guildid: string;
    roleid: string;
    level: number;
}

export interface BSRow {
    updateId: number;
    logDate: Date;
    numUsers: number;
    numGuilds: number;
    numChannels: number;
}

export interface XMessage extends Message {
    gprefix?: string;
}

export interface InsertionResult {
    fieldCount: number;
    affectedRows: number;
    insertId: number;
    serverStatus: number;
    warningCount: number;
    message: string;
    //protocol41: boolean;
    changedRows: number;
}

export interface GuildSettingsRow {
    id: number;
    guildid: string;
    property: string;
    value: string;
    previousvalue: string;
}

export interface CmdTrackingRow {
    cmdname: string;
    used: number;
    iscmd: number
}

export interface TwitchHookRow {
    id: string;
    streamerid: string;
    guildid: string;
    channelid: string;
    streamerlogin: string;
    message: string;
    expires: string;
}

export interface PartialGuildObject extends DiscordStrategy.GuildInfo {
    features?: string[];
    permissions_new?: string;
}

export interface DashUserObject {
    id: string;
    tag: string;
    avatar: string;
    guilds: PartialGuildObject[];
}

export interface MessageService {
    name?: string;
    disabled?: true;
    getInformation?(client: XClient, guildid: string): Promise<string>;
    execute(client: XClient, message: XMessage): Promise<void>;
}

export interface UnparsedTimedAction {
    actionid: string;
    exectime: string;
    actiontype: string;
    actiondata: string;
}

export interface TimedAction {
    id: string;
    time: Date;
    type: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: Record<string, any>;
}

export interface UnmuteActionData {
    guildid: string;
    userid: string;
    roleid: string;
    duration: string;
}

export interface UserDataRow {
    userid: string;
    afk: string;
}

export interface AutomoduleData {
    name: string;
    enableAll: boolean;
    channels: string[];
    applyRoles: string[];
    roleEffect: 'ignore' | 'watch';
}