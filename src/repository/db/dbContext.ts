import { has, get } from 'config';
import 'reflect-metadata';
import { injectable } from 'inversify';
import { ConnectionPool, IOptions, config, Transaction, PreparedStatement } from 'mssql';
import { from, Observable, fromEventPattern, fromEvent, Observer, of } from 'rxjs';
import { map } from 'rxjs/operators';

export const IDBConnectionSymbol = Symbol.for('DBConnection');

@injectable()
export class DBConnection {
    private readonly connectionPoolSecurityOptions: IOptions;
    constructor() {
        this.connectionPoolSecurityOptions = {
            abortTransactionOnError: true,
            encrypt: true,
            trustedConnection: true,
            useUTC: true
        };
    }
    get getReadConnection(): Observable<ConnectionPool> {
        return from(this.getDBConnectionPool().connect());
    }
    get getTransactionConnection(): Observable<Transaction> {
        return from(this.getDBConnectionPool().connect())
            .pipe(map((connection: ConnectionPool) => {
                return new Transaction(connection);
            }));
    }
    getPreparedConnection(connection: ConnectionPool | Transaction): PreparedStatement {
        return (connection instanceof Transaction) ?
            new PreparedStatement(connection) :
            new PreparedStatement(connection);
    }
    private getDBConnectionPool(): ConnectionPool {
        let dbConfig: any = has('db') ? get('db') : undefined;
        let dbPool: any = has('db.pool') ? get('db.pool') : undefined;
        let mssqlConfig: config = {} as config;
        if (dbConfig) {
            mssqlConfig = {
                user: dbConfig.user,
                server: dbConfig.server,
                database: dbConfig.database,
                password: dbConfig.password,
                connectionTimeout: dbConfig.timeout,
                requestTimeout: dbConfig.timeout,
                pool: {
                    min: dbPool.min,
                    max: dbPool.max,
                    idleTimeoutMillis: dbPool.idletimeout
                }
            };
            if (dbConfig.encryption) {
                mssqlConfig.options = this.connectionPoolSecurityOptions;
            }
        }
        return new ConnectionPool(mssqlConfig);
    }

}
