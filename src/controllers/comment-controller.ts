import { Request, Response, Router, NextFunction } from 'express';
import { IoC } from '../container/resolver';
import { ICommentService, ICommentServiceSymbol } from '../services/commentServices';
import { IBaseIdentityComment, IComment } from '../model/comment';
import { ICustomError } from '../model/error';
import * as modelValidate from '../handlers/validation-handler';
import { HttpStatus, ErrorMessage } from '../utilities/messages-status';

export class CommentController {
    constructor(route: Router) {
        route.get('/', this.getUsersComments.bind(this));
        route.get('/users', this.getUsers.bind(this));
        route.get('/:userid', this.getCommentByUserId.bind(this));
        route.get('/reply/:commentid', this.getCommentReplyByCommentId.bind(this));
        route.put('/edit', this.editUserComment.bind(this));
        route.post('/add', this.addUserComment.bind(this));
        route.post('/reply', this.userReplyComment.bind(this));
    }
    getCommentByUserId(req: Request, res: Response, next: NextFunction): void {
        let userid: string = req.params.userid;
        if (!modelValidate.getuuidValidation(userid)) {
            res.status(HttpStatus.BadRequest).send(ErrorMessage.InvalidModel);
            return;
        }
        IoC.get<ICommentService>(ICommentServiceSymbol).getCommentsByUserId(userid)
            .subscribe((result) => {
                res.status(200).send(result);
                next();
            }, (err: ICustomError) => {
                res.status(err.status).send(err.error);
                next(err);
            });
    }
    getCommentReplyByCommentId(req: Request, res: Response, next: NextFunction): void {
        let commentId: string = req.params.commentid;
        if (!modelValidate.getuuidValidation(commentId)) {
            res.status(HttpStatus.BadRequest).send(ErrorMessage.InvalidModel);
            return;
        }
        IoC.get<ICommentService>(ICommentServiceSymbol).getCommentReplyByCommentId(commentId)
            .subscribe((replies) => {
                res.status(200).send(replies);
                next();
            }, (err: ICustomError) => {
                res.status(err.status).send(err.error);
                next(err);
            });
    }
    addUserComment(req: Request, res: Response, next: NextFunction): void {
        let comment: IComment = req.body;
        if (!modelValidate.addUserCommentvalidation(comment)) {
            res.status(HttpStatus.BadRequest).send(ErrorMessage.InvalidModel);
            next(ErrorMessage.InvalidModel);
        }
        IoC.get<ICommentService>(ICommentServiceSymbol).addUserComment(comment)
            .subscribe((comment) => {
                res.status(200).send(comment);
                next();
            }, (err: ICustomError) => {
                res.status(err.status).send(err.error);
                next(err);
            });
    }
    editUserComment(req: Request, res: Response, next: NextFunction): void {
        let existingComment: IBaseIdentityComment = req.body;
        if (!modelValidate.editCommentValidation(existingComment)) {
            res.status(HttpStatus.BadRequest).send(ErrorMessage.InvalidModel);
            return;
        }
        IoC.get<ICommentService>(ICommentServiceSymbol).editUserComment(existingComment)
            .subscribe((updatedComment) => {
                res.status(200).send(updatedComment);
                next();
            }, (err: ICustomError) => {
                res.status(err.status).send(err.error);
                next(err);
            });
    }
    userReplyComment(req: Request, res: Response, next: NextFunction): void {
        let comment: IBaseIdentityComment = req.body;
        if (!modelValidate.userReplyValidation(comment)) {
            res.status(HttpStatus.BadRequest).send(ErrorMessage.InvalidModel);
            return;
        }
        IoC.get<ICommentService>(ICommentServiceSymbol).addUserComment(comment)
            .subscribe((replyComment) => {
                res.status(200).send(replyComment);
                next();
            }, (err: ICustomError) => {
                res.status(err.status).send(err.error);
                next(err);
            });
    }
    getUsersComments(req: Request, res: Response, next: NextFunction): void {
        IoC.get<ICommentService>(ICommentServiceSymbol).getAllUserComments()
            .subscribe((comments) => {
                res.status(200).send(comments);
                next();
            }, (err: ICustomError) => {
                res.status(err.status).send(err.error);
                next(err.error);
            });
    }
    getUsers(req: Request, res: Response, next: NextFunction): void {
        IoC.get<ICommentService>(ICommentServiceSymbol).getUsers().subscribe((users) => {
            res.status(200).send(users);
            return;
        }, (err: ICustomError) => {
            res.status(err.status).send(err.error);
            next(err.error);
        });
    }
}
