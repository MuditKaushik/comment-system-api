import { injectable, inject } from 'inversify';
import 'reflect-metadata';
import { DBConnection, IDBConnectionSymbol } from '../db/dbContext';
import { Observable, from, pipe } from 'rxjs';
import { ConnectionPool, VarChar, TYPES, IResult } from 'mssql';
import { flatMap, catchError, map } from 'rxjs/operators';
import { errorhandler } from '../../handlers/error-handler';
import { IBaseIdentityComment } from '../../model/comment';
import { IUserModel, ICommentAll } from '../../model/user';

export const ICommentRepositorySymbol = Symbol.for('ICommentRepository');

export interface ICommentRepository {
    getUserByUserId(userId: string): Observable<IUserModel>;
    getUserCommentsByUserId(userId: string): Observable<Array<IBaseIdentityComment>>;
    getCommentByCommentId(commentId: string): Observable<IBaseIdentityComment>;
    getReplyByCommentId(commentId: string): Observable<Array<IBaseIdentityComment>>;
    getAllUserComments(): Observable<Array<ICommentAll>>;
    getAllUsers(): Observable<Array<IUserModel>>;
}
@injectable()
export class CommentRepository implements ICommentRepository {
    private readonly db: DBConnection;
    constructor(@inject(IDBConnectionSymbol) private readonly _db: DBConnection) {
        this.db = this._db;
    }
    getUserByUserId(userId: string): Observable<IUserModel> {
        return this.db.getReadConnection.pipe(flatMap((readConnection: ConnectionPool) => {
            let request = readConnection.request();
            request.input('userid', VarChar, userId);
            let sqlQuery = `
            SELECT 
                userid,firstName,middleName,lastName,email,username 
            FROM users 
            WHERE userid = @userid ORDER BY createdate desc`;
            return from(request.query(sqlQuery)).pipe(flatMap((dbResult: IResult<any>) => {
                let user: IUserModel = {} as IUserModel;
                if (dbResult.recordset.length) {
                    let dbUser = dbResult.recordset[0];
                    user = {
                        userid: dbUser.userid,
                        email: dbUser.email,
                        firstName: dbUser.firstName,
                        lastName: dbUser.lastName,
                        middleName: dbUser.middlename,
                        username: dbUser.username
                    };
                }
                return from(readConnection.close()).pipe(map(() => {
                    return user;
                }));
            }));
        }), catchError(errorhandler));
    }
    getUserCommentsByUserId(userId: string): Observable<Array<IBaseIdentityComment>> {
        return this.db.getReadConnection.pipe(flatMap((readConnection: ConnectionPool) => {
            let request = readConnection.request();
            request.input('userid', VarChar, userId);
            let sqlQuery = `
            SELECT 
                commentid,userid,comment,parentid,createdate 
            FROM comments 
            WHERE userid = @userid ORDER BY createdate desc`;
            return from(request.query(sqlQuery)).pipe(flatMap((dbResult: IResult<any>) => {
                let userComments: Array<IBaseIdentityComment> = new Array<IBaseIdentityComment>();
                for (let column of dbResult.recordsets[0]) {
                    userComments.push({
                        commentid: column.commentid,
                        comment: column.comment,
                        parentid: column.parentid,
                        datetime: column.createdate,
                        userid: column.userid
                    });
                }
                return from(readConnection.close()).pipe(map(() => {
                    return userComments;
                }));
            }));
        }), catchError(errorhandler));
    }
    getCommentByCommentId(commentId: string): Observable<IBaseIdentityComment> {
        return this.db.getReadConnection.pipe(flatMap((readConnection: ConnectionPool) => {
            let request = readConnection.request();
            request.input('commentId', TYPES.VarChar, commentId);
            let readCommentQuery = `
            SELECT 
                commentid,userid,comment,parentid,createdate
             FROM 
                comments WHERE commentid = @commentId`;
            return from(request.query(readCommentQuery)).pipe(flatMap((dbResult: IResult<any>) => {
                let comment: IBaseIdentityComment = {} as IBaseIdentityComment;
                if (dbResult.rowsAffected.length > 0 && dbResult.recordset.length > 0) {
                    let userComment = dbResult.recordset[0];
                    comment = {
                        comment: userComment.comment,
                        commentid: userComment.commentid,
                        datetime: userComment.createdate,
                        userid: userComment.userid,
                        parentid: userComment.parentid
                    };
                }
                return from(readConnection.close()).pipe(map(() => {
                    return comment;
                }));
            }));
        }), catchError(errorhandler));
    }
    getReplyByCommentId(commentId: string): Observable<Array<IBaseIdentityComment>> {
        return this.db.getReadConnection.pipe(flatMap((readConnection: ConnectionPool) => {
            let request = readConnection.request();
            request.input('commentId', TYPES.NVarChar, commentId);
            let readSqlQuery = `
                SELECT 
                    commentid,userid,comment,parentid,createdate
                FROM 
                    comments
                WHERE 
                    parentid = @commentId
                ORDER BY createdate desc
            `;
            return from(request.query(readSqlQuery)).pipe(flatMap((dbResult: IResult<any>) => {
                let replies: Array<IBaseIdentityComment> = new Array<IBaseIdentityComment>();
                for (let reply of dbResult.recordsets[0]) {
                    replies.push({
                        comment: reply.comment,
                        commentid: reply.commentid,
                        datetime: reply.createdate,
                        parentid: reply.parentid,
                        userid: reply.userid
                    });
                }
                return from(readConnection.close()).pipe(map(() => {
                    return replies;
                }));
            }));
        }), catchError(errorhandler));
    }
    getAllUserComments(): Observable<Array<ICommentAll>> {
        return this.db.getReadConnection.pipe(flatMap((readConnection: ConnectionPool) => {
            let request = readConnection.request();
            let sqlQuery = `
            SELECT 
                c.commentid as commentid,
                c.comment as comment,
                c.parentid as parentid,
                c.createdate as createdate,
                u.userid as userid,
                CONCAT(u.firstName,u.middleName,u.lastName) as name,
                u.username as username,
                u.email as email
            FROM 
                comments as c INNER JOIN users as u 
            ON 
                c.userid = u.userid
            WHERE 
                c.parentid IS NULL
            ORDER BY 
                c.createdate desc;
            `;
            return from(request.query(sqlQuery)).pipe(flatMap((dbResult: IResult<any>) => {
                let allUserComments: Array<ICommentAll> = new Array<ICommentAll>();
                for (let column of dbResult.recordsets[0]) {
                    allUserComments.push({
                        commentid: column.commentid,
                        comment: column.comment,
                        parentid: column.parentid,
                        datetime: column.createdate,
                        userid: column.userid,
                        email: column.email,
                        name: column.name,
                        username: column.username
                    });
                }
                return from(readConnection.close()).pipe(map(() => {
                    return allUserComments;
                }));
            }));
        }), catchError(errorhandler));
    }
    getAllUsers(): Observable<Array<IUserModel>> {
        return this.db.getReadConnection.pipe(flatMap((readConnection: ConnectionPool) => {
            let request = readConnection.request();
            let sqlQuery = `
            SELECT 
                userid,firstName,middleName,lastName,email,username 
            FROM users`;
            return from(request.query(sqlQuery)).pipe(flatMap((dbResult: IResult<any>) => {
                let user: Array<IUserModel> = new Array<IUserModel>();
                for (let dbUser of dbResult.recordsets[0]) {
                    user.push({
                        userid: dbUser.userid,
                        email: dbUser.email,
                        firstName: dbUser.firstName,
                        lastName: dbUser.lastName,
                        middleName: dbUser.middlename,
                        username: dbUser.username
                    });
                }
                return from(readConnection.close()).pipe(map(() => {
                    return user;
                }));
            }));
        }), catchError(errorhandler));
    }
}
