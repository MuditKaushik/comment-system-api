import express, { Application } from 'express';
import * as bodyParser from 'body-parser';
import { has, get } from 'config';
import { from } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
// import { serve, setup } from 'swagger-ui-express';
import { IoC, RepositoryResolver, ServicesResolver } from './container/resolver';
import { RequestHandlers } from './handlers/request-handlers';
export let app: Application;
export class CommentSystemServer {
    constructor() {
        app = express();
        this.serverInitialize();
    }
    private serverInitialize(): void {
        from(IoC.loadAsync(RepositoryResolver(), ServicesResolver()))
            .pipe(map(() => {
                console.debug('1) Dependencies are resolved.');
            }), map(() => {
                this.serverConfig(app);
            }), map(() => {
                this.resolveRequestHandler();
            }), map(() => {
                if (has('port')) {
                    return get<number>('port');
                } else {
                    throw new Error('Unable to find port number in configuration.');
                }
            }), catchError((err) => {
                IoC.unbindAll();
                app.disable('setting');
                console.debug('Actual Error', err);
                throw new Error('Error occured while setting up server.');
            })).subscribe((port) => {
                this.createServer(app, port);
            }, (err) => {
                console.debug(err);
            });
    }
    private serverConfig(app: Application): void {
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({ extended: false }));
        console.debug('2) Server is configured.');
    }
    private resolveRequestHandler(): void {
        let requestHandler = new RequestHandlers();
        app.use('/comment', requestHandler.commentHandler);
        console.debug('3) Server routes/endpoints are configured.');
    }
    private createServer(app: Application, port: number): void {
        app.listen(port, () => {
            console.debug(`4) Server is running and listening at ${port}`);
            console.debug('Application successfully running.');
        });
    }
}

new CommentSystemServer();
