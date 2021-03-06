import React from 'react';
import { /*Input, Button, Container*/ Switch, FormControl, FormLabel, Center, Spinner } from '@chakra-ui/react';
import { Formik, ErrorMessage } from "formik";
import { HomeProps } from '../../pages/DashboardPage';
import * as yup from 'yup';

/*function ModSwitch(event: React.ChangeEvent<HTMLInputElement>) {
    console.log(event)
}*/

export function DashboardHome(props: HomeProps/* {match}: RouteComponentProps<MatchParams> */) {
    const [permNotif, setPermNotif] = React.useState<boolean>(false)
    const [moderation, setModeration] = React.useState(props.meta.moderation || false);
    const firstMod = React.useRef(true);
    const { setStatus } = props;
    const [loaded, setLoaded] = React.useState(false);

    React.useEffect(() => {
        fetch(`/api/discord/guilds/${props.meta.id}/home`)
            .then(x => x.json())
            .then(d => {
                //console.log(d)
                setPermNotif(d.home.permNotif);
                setLoaded(true);
            })
            .catch(e => {
                setStatus(e.message);
                setLoaded(true);
            })
    }, [props, setStatus])

    React.useEffect(() => {
        if (firstMod.current) {
            firstMod.current = false;
            return;
        }
        const hdrs = new Headers();
        hdrs.append("Content-Type", "application/x-www-form-urlencoded");
        const fd = new URLSearchParams();
        fd.append("moderation", `${moderation}`);
        const obj = {
            method: 'PUT',
            headers: hdrs,
            body: fd
        };
        try {
            fetch(`/api/discord/guilds/${props.meta.id}/moderation`, obj)
                .then(x => x.json())
                .then((d: { guild: { id: string, moderation: string } }) => {
                    if (d.guild && d.guild.moderation === `${moderation}`) {
                        setStatus({ module: "moderation", msg: "Saved.", success: true });
                    } else {
                        setStatus({ module: "moderation", msg: "Failed to save.", success: false });
                    }
                })
        } catch (error) {
            console.error(error);
            setStatus({ module: "moderation", msg: "Failed to save.", success: false });
        }
    }, [moderation, props.meta.id, setStatus]);

    const prefixSchema = yup.object().shape({
        prefix: yup.string().required()
    });

    const handleAccessMessageClicked = (e: React.ChangeEvent<HTMLInputElement>) => {
        console.log(e);
        let am = false;
        if (e.target.checked) {
            am = true;
        }
        const hdrs = new Headers();
        hdrs.append("Content-Type", "application/x-www-form-urlencoded");
        const fd = new URLSearchParams();
        fd.append("permnotif", `${am}`);
        const obj = {
            method: 'PUT',
            headers: hdrs,
            body: fd
        };
        try {
            fetch(`/api/discord/guilds/${props.meta.id}/permnotif`, obj)
                .then(x => x.json())
                .then((d: { guild: { id: string, permNotif: string } }) => {
                    if (d.guild && d.guild.permNotif === `${am}`) {
                        setStatus({ msg: "Saved.", success: true });
                    } else {
                        setStatus({ msg: "Failed to save.", success: false });
                    }
                })
        } catch (error) {
            console.error(error);
            setStatus({ msg: "Failed to save.", success: false });
        }
    }

    return loaded ? (
        <div style={{ width: "100%", padding: "0 15px", marginLeft: "auto", marginRight: "auto" }}>
            <br />
            <div className="control-row">
                <div className="x-card-parent">
                    <div className="x-card">
                        <div className="x-card-header">About This Dashboard</div>
                        <div className="x-card-body">
                            <p>This site is meant to be a place where server admins can come and configure the behavior of Stratum, and even their server, without having to mess around with commands or other decentralized settings panes.</p>
                            <hr style={{ marginTop: 10, marginBottom: 15 }} />
                            <h4 className="cardsubtitle">Dashboard Development</h4>
                            <p>There obviously isn't much here right now, but this page was launched so that there would be a hint at a future full-featured dashboard. What you see now is probably not what the final product will look like/behave like, but it is the current rough design. This page was also launched so that I could be sure that the dashboard would turn on and be navigable, as well as perform with the backend API of Stratum.</p>
                            <br/>
                            <p>The main goal at the moment is coming to a final initial design. This means having a site that has full interactions (no dead buttons) with a mobile friendly UI (which may take a while). After that, the actual settings panes can enter the development phase. The prefix settings pane got to be first because it is special.</p>
                        </div>
                    </div>
                </div>
                <div className="x-card-parent">
                    <div className="x-card">
                        <div className="x-card-header">Moderation</div>
                        <div className="x-card-body">
                            <h4 className="cardsubtitle">Toggle Moderation Features</h4>
                            <p style={{ marginBottom: "1rem" }}>Set whether moderation features are allowed to be used on Stratum.</p>
                            <FormControl display="flex" alignItems="center">
                                <FormLabel htmlFor="enable-moderation-all" mb="0">
                                    Enable moderation?
                                </FormLabel>
                                <Switch id="enable-moderation-all" onChange={(e) => setModeration(e.target.checked)} defaultChecked={props.meta.moderation} />
                            </FormControl>
                            <hr style={{ marginTop: 10, marginBottom: 15 }} />
                            <h4 className="cardsubtitle">No Perms Access Message</h4>
                            <p style={{ marginBottom: "1rem" }}>Toggle the option to notify users that they don't have the required permissions when they use an elevated command.</p>
                            <FormControl display="flex" alignItems="center">
                                <FormLabel htmlFor="enable-permnotif" mb="0">
                                        Enable access message?
                                </FormLabel>
                                <Switch id="enable-permnotif" onChange={handleAccessMessageClicked} defaultChecked={permNotif} />
                            </FormControl>
                            {/*status && status.module === "moderation" && (
                                <>
                                    <br />
                                    <br />
                                    <div className={`field-alert ${status.success ? "field-success" : "field-error"}`}>
                                        {status.msg}
                                    </div>
                                </>
                            )*/}
                        </div>
                    </div>
                </div>
                <div className="x-card-parent">
                    <div className="x-card">
                        <div className="x-card-header">Prefix</div>
                        <div className="x-card-body">
                            <Formik
                                initialValues={{ prefix: props.meta.prefix }}
                                onSubmit={async (values, actions) => {
                                    try {
                                        const hdrs = new Headers();
                                        hdrs.append("Content-Type", "application/x-www-form-urlencoded");
                                        const fd = new URLSearchParams();
                                        fd.append("prefix", `${values.prefix}`);
                                        const obj = {
                                            method: 'PUT',
                                            headers: hdrs,
                                            body: fd
                                        };
                                        await fetch(`/api/discord/guilds/${props.meta.id}/prefix`, obj);
                                        setStatus({
                                            msg: "Prefix updated.",
                                            success: true
                                        });
                                        /*actions.setStatus({
                                            sent: true,
                                            msg: "Prefix updated."
                                        })*/
                                    } catch (e) {
                                        console.error(e);
                                        setStatus({
                                            msg: "There was an error. Try reloading.",
                                            success: false
                                        });
                                        /*actions.setStatus({
                                            sent: false,
                                            msg: "There was an error. Try reloading."
                                        })*/
                                    }
                                }}
                                validationSchema={prefixSchema}
                            >
                                {
                                    (fprops) => (
                                        <form onSubmit={fprops.handleSubmit}>
                                            <h4 className="cardsubtitle">Set Bot Prefix</h4>
                                            <p style={{ marginBottom: "1rem" }}>Set the prefix of the bot in the server.</p>
                                            <div className="input-group">
                                                <input type="text" name="prefix" onChange={fprops.handleChange} defaultValue={fprops.values.prefix} style={{ color: "black", padding: "5px 8px" }} />
                                                <button className="c-button" type="submit" disabled={fprops.isSubmitting}>Update Prefix</button>
                                                <br/>
                                                <br/>
                                                {fprops.status && fprops.status.msg && (
                                                    <div className={`${fprops.status.sent ? "field-success" : "field-error"}`} style={{ position: "relative", padding: 5 }}>
                                                        {fprops.status.msg}
                                                    </div>
                                                )}
                                                <ErrorMessage name="prefix">
                                                    {(msg) => (
                                                        <div className="field-error" style={{position: "relative", padding: 5}}>{msg}</div>
                                                    )}
                                                </ErrorMessage>
                                            </div>
                                        </form>
                                    )
                                }
                            </Formik>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    ) : (
        <Center className="lspinner">
            <Spinner color="red.500" size="xl" css="margin:auto" />
        </Center>
    )
}