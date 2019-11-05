import 'reflect-metadata';
import { inject, injectable } from 'inversify';
import { Observable, forkJoin } from 'rxjs';
import { map, flatMap, timeout } from 'rxjs/operators';
import { IUserComments, IBaseIdentityComment, IComment, IAllUsersComments } from '../model/comment';
import { ICommentRepository, ICommentRepositorySymbol } from '../repository/read/commentsRepository';
import { IWriteCommentRepository, IWriteCommentRepositorySymbol } from '../repository/write/commentRepository';
import { IUserModel, ICommentAll } from '../model/user';

export const ICommentServiceSymbol = Symbol.for('ICommentService');
export interface ICommentService {
    getUsers(): Observable<Array<IUserModel>>;
    getUserByUserId(userId: string): Observable<IUserModel>;
    getCommentsByUserId(userId: string): Observable<IUserComments>;
    getCommentReplyByCommentId(commentId: string): Observable<Array<ICommentAll>>;
    getAllUserComments(): Observable<Array<ICommentAll>>;
    addUserComment(comment: IComment): Observable<IBaseIdentityComment>;
    editUserComment(comment: IBaseIdentityComment): Observable<IBaseIdentityComment>;
}
@injectable()
export class CommentService implements ICommentService {
    private readonly _readCommentRepo: ICommentRepository;
    private readonly _writeCommentRepo: IWriteCommentRepository;
    constructor(
        @inject(ICommentRepositorySymbol) readRepo: ICommentRepository,
        @inject(IWriteCommentRepositorySymbol) writeRepo: IWriteCommentRepository
    ) {
        this._readCommentRepo = readRepo;
        this._writeCommentRepo = writeRepo;
    }
    getUserByUserId(userId: string): Observable<IUserModel> {
        return this._readCommentRepo.getUserByUserId(userId).pipe(map((dbRecord) => {
            return dbRecord;
        }));
    }
    getCommentsByUserId(userId: string): Observable<IUserComments> {
        let userComments: IUserComments = {} as IUserComments;
        return this._readCommentRepo.getUserByUserId(userId).pipe(map((user) => {
            userComments.user = user;
        }), flatMap(() => {
            return this._readCommentRepo.getUserCommentsByUserId(userId);
        }), map((comments) => {
            userComments.comments = comments;
            return userComments;
        }));
    }
    addUserComment(comment: IComment): Observable<IBaseIdentityComment> {
        return this._writeCommentRepo.addUserComment(comment).pipe(map((commentId: string) => {
            return commentId;
        }), flatMap((commentId: string) => {
            return this._readCommentRepo.getCommentByCommentId(commentId);
        }), map((comment: IBaseIdentityComment) => {
            return comment;
        }));
    }
    editUserComment(updateComment: IBaseIdentityComment): Observable<IBaseIdentityComment> {
        return this._readCommentRepo.getCommentByCommentId(updateComment.commentid)
            .pipe(flatMap((comment) => {
                return this._writeCommentRepo.updateUserComment(comment.commentid, updateComment.comment);
            }), flatMap((commentId: string) => {
                return this._readCommentRepo.getCommentByCommentId(commentId);
            }));
    }
    getCommentReplyByCommentId(commentId: string): Observable<Array<ICommentAll>> {
        return this._readCommentRepo.getReplyByCommentId(commentId)
            .pipe(map((replies: Array<ICommentAll>) => {
                return replies;
            }));
    }
    getAllUserComments(): Observable<Array<ICommentAll>> {
        return this._readCommentRepo.getAllUserComments().pipe(map((comments: Array<ICommentAll>) => {
            return comments;
        }));
    }
    getUsers(): Observable<Array<IUserModel>> {
        return this._readCommentRepo.getAllUsers().pipe(map((users: Array<IUserModel>) => {
            return users;
        }));
    }
}