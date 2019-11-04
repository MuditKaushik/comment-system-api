import { TYPES, Transaction, PreparedStatement } from 'mssql';
import { DBConnection } from '../db/dbContext';
import { injectable } from 'inversify';
import 'reflect-metadata';
import { Observable, from } from 'rxjs';
import { map, flatMap, catchError, mergeMap, } from 'rxjs/operators';
import * as uuid from 'uuid';
import { errorhandler } from '../../handlers/error-handler';
import { IUserComments, IComment } from '../../model/comment';

export const IWriteCommentRepositorySymbol = Symbol.for('IWriteCommentRepository');
export interface IWriteCommentRepository {
    addUserComment(comment: IComment): Observable<string>;
    updateUserComment(commentid: string, comment: string): Observable<string>;
}
@injectable()
export class WriteCommentRepository implements IWriteCommentRepository {
    private readonly dbConnect: DBConnection;
    constructor() {
        this.dbConnect = new DBConnection();
    }
    addUserComment(comment: IComment): Observable<string> {
        let commentId: string = uuid.v4();
        let transtraction: Transaction;
        let prepareStatement: PreparedStatement;
        return this.dbConnect.getTransactionConnection.pipe(flatMap((connection) => {
            transtraction = connection;
            return from(transtraction.begin());
        }), map(() => {
            prepareStatement = this.dbConnect.getPreparedConnection(transtraction);
            prepareStatement.input('commentid', TYPES.NVarChar);
            prepareStatement.input('userid', TYPES.NVarChar);
            prepareStatement.input('comment', TYPES.NVarChar);
            prepareStatement.input('parentid', TYPES.NVarChar);
            prepareStatement.input('createdate', TYPES.DateTime);
            prepareStatement.input('updatedate', TYPES.DateTime);
        }), flatMap(() => {
            let query = `INSERT INTO comments(commentid,userid,comment,parentid,createdate,updatedate)
            VALUES(@commentid,@userid,@comment,@parentid,@createdate,@updatedate)`;
            return from(prepareStatement.prepare(query));
        }), flatMap(() => {
            return from(prepareStatement.execute({
                commentid: commentId,
                userid: comment.userid,
                comment: comment.comment.trim(),
                parentid: comment.parentid,
                createdate: new Date(),
                updatedate: new Date()
            }));
        }), flatMap((result) => {
            return from(prepareStatement.unprepare()).pipe(map(() => {
                if (result.rowsAffected.length > 0) {
                    transtraction.commit();
                } else {
                    transtraction.rollback();
                }
                return commentId;
            }));
        }), catchError((err) => {
            transtraction.rollback();
            return errorhandler(err);
        }));
    }
    updateUserComment(commentid: string, comment: string): Observable<string> {
        let transtraction: Transaction;
        let preparedStatement: PreparedStatement;
        return this.dbConnect.getTransactionConnection.pipe(flatMap((connection) => {
            transtraction = connection;
            return from(transtraction.begin());
        }), map(() => {
            preparedStatement = this.dbConnect.getPreparedConnection(transtraction);
            preparedStatement.input('comment', TYPES.NVarChar);
            preparedStatement.input('commentid', TYPES.NVarChar);
            return preparedStatement;
        }), flatMap((prepareStatement: PreparedStatement) => {
            let updateCommentQuery = `
            UPDATE comments SET 
                comment = @comment
            WHERE 
                commentid = @commentid;
            `;
            return from(preparedStatement.prepare(updateCommentQuery));
        }), flatMap(() => {
            return from(preparedStatement.execute({
                comment: comment.trim(),
                commentid: commentid
            }));
        }), flatMap((dbResult) => {
            return from(preparedStatement.unprepare()).pipe(map(() => {
                if (dbResult.rowsAffected.length > 0) {
                    transtraction.commit();
                } else {
                    transtraction.rollback();
                }
                return commentid;
            }));
        }), catchError((err) => {
            transtraction.rollback();
            return errorhandler(err);
        }));
    }
}
