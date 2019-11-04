import { CommentController } from '../controllers/comment-controller';
import { Router } from 'express';

export class RequestHandlers {
    get commentHandler(): Router {
        let commentRoutes: Router = Router();
        new CommentController(commentRoutes);
        return commentRoutes;
    }
}
