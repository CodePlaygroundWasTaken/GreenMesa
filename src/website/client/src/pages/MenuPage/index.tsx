import React from 'react';
import { host } from '../../index';
import { DashHeader, GuildMenuItem } from '../../components';
import { Spinner, Center } from '@chakra-ui/react';
import LoadingBar from 'react-top-loading-bar';
import { IUser } from '../DashboardPage';
import './GuildMenu.css';
import { GuildItemSpecial, GuildsEndpointData } from '../../../../../gm';
//import { RouteComponentProps } from 'react-router-dom';
//import { RESTAPIPartialCurrentUserGuild } from 'discord-api-types';

/*interface IUser {
    guilds: RESTAPIPartialCurrentUserGuild[];
    avatar: string;
    tag: string;
    id: string
}*/

export function MenuPage(/*props: RouteComponentProps*/) {

    const [user, setUser] = React.useState<IUser>({});
    const [loading, setLoading] = React.useState(true);
    const [guilds, setGuilds] = React.useState<GuildItemSpecial[]>([]);
    const [progress, setProgress] = React.useState(0)

    React.useEffect(() => {
        fetch("/api/auth")
            .then(x => x.json())
            .then(d => {
                setUser(d);
                setProgress(50);
                return fetch("/api/discord/guilds");
            })
            .then(x => x.json())
            .then((d: GuildsEndpointData) => {
                setGuilds(d.guilds);
                setLoading(false);
                setProgress(100);
            })
            .catch((e) => {
                //props.history.push("/api/auth/discord");
                window.location.href = `${host}/api/auth/discord?redirect=${encodeURIComponent(window.location.href)}`;
                setLoading(false);
            })
    }, [])

    return (
        <div>
            <LoadingBar
                color='#01FF70'
                progress={progress}
                onLoaderFinished={() => setProgress(0)}
            />
            {!loading ?
            <div style={{ display: "flex" }}>
                <DashHeader user={user} />
                <div className="guilds-menu-center">
                    {guilds.map((guild) => (
                        <GuildMenuItem guild={guild} key={guild.id} />
                    ))}
                </div>
            </div> :
            <Center className="lspinner">
                <Spinner color="red.500" size="xl" css="margin:auto" />
            </Center>
            }
        </div>
    )
}