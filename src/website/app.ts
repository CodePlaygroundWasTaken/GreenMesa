import { XClient } from "src/gm";

require('./strategies/discord');

//const xlg = require("../xlogger");
import express from "express";
import passport from 'passport';
import helmet from "helmet";
import path from "path";
import routes from './routes';
import session from "express-session";
import mstore from 'express-mysql-session';
const PORT = process.env.WEBSITE_PORT || 3002;
//const STATIC = process.env.DASHBOARD_STATIC_LOC || "./website/static";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const MySQLStore = mstore(<any>session);
const STATIC = "./static";

export default class MesaWebsite {
	public client: XClient;
	public app: express.Application;

    constructor(client: XClient) {
        this.client = client;
        this.app = express();
        
        this.app.use(helmet({ frameguard: { action: "deny" }, contentSecurityPolicy: false }));// will have to see if this actually protects
        //this.app.set('x-powered-by', false);
        this.app.set('etag', false);
        //this.app.use(express.json());// THIS IS WHAT WAS BREAKING THE TWITCH SECURITY MIDDLEWARE
        this.app.use(express.urlencoded({ extended: false }));
        this.app.use(session({
            secret: process.env.DASHBOARD_COOKIE_SECRET || "potato",
            cookie: {
                maxAge: 60000 * 60 * 24
            },
            resave: false,
            saveUninitialized: false,
            store: new MySQLStore({}, client.database?.db)
        }));
        this.app.use(passport.initialize());
        this.app.use(passport.session());
        this.app.use(function (req, res, next) {
            res.header("x-powered-by", "Sadness")
            next();
        });
        this.app.use(express.static(path.join(__dirname, STATIC), {
            index: false,
            extensions: ['html']
        }));// https://stackoverflow.com/a/40201169/10660033
        this.app.use('/api', routes(this.client));
        this.app.get("/", (req, res) => {
            res.sendFile(path.join(__dirname, STATIC, "index.html"));
        });
        this.app.get("/invite", async (req, res) => {
            const url = await this.client.generateInvite(2147483639);
            res.redirect(301, url);
        });
        this.app.get("/logout", (req, res) => {
            req.logout();
            res.redirect("/");
        })

        if (process.env.NODE_ENV === "production") {
            this.app.use(express.static(path.join(__dirname, 'client/build')));
            this.app.get(/(dash\/?|menu\/?).*/, function (req, res) {
                res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
            });
        }

        // Since this is the last non-error-handling
        // middleware use()d, we assume 404, as nothing else
        // responded.

        // $ curl http://localhost:3000/notfound
        // $ curl http://localhost:3000/notfound -H "Accept: application/json"
        // $ curl http://localhost:3000/notfound -H "Accept: text/plain"

        this.app.use(function (req, res) {
            res.status(404);

            // respond with html page
            /*if (req.accepts('html')) {// an engine is required here
                res.render('404', {
                    url: req.url
                });
                return;
            }*/

            // respond with json
            if (req.accepts('json')) {
                res.send({
                    error: 'Not found'
                });
                return;
            }

            // default to plain-text. send()
            res.type('txt').send('Not found');
        });
        this.app.listen(PORT, () => console.log(`Running on port ${PORT}`));
    }

}