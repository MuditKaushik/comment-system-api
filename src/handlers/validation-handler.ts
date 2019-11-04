import { IBaseIdentityComment, IComment } from '../model/comment';
import validate from 'uuid-validate';

export function getuuidValidation(uuid: string): boolean {
    return validate(uuid, 4);
}

export function addUserCommentvalidation(comment: IComment): boolean {
    let isValid: boolean = true;
    if (!Object.keys(comment).length || !comment.comment.length || !validate(comment.userid, 4)) {
        isValid = false;
    }
    return isValid;
}

export function editCommentValidation(comment: IBaseIdentityComment): boolean {
    let isValid: boolean = true;
    if (!Object.keys(comment).length || !validate(comment.commentid, 4) || !validate(comment.userid, 4) || !comment.comment.trim().length) {
        isValid = false;
    }
    return isValid;
}

export function userReplyValidation(comment: IBaseIdentityComment): boolean {
    let isValid: boolean = true;
    if (!Object.keys(comment).length || !validate(comment.userid, 4) || (comment.parentid && !validate(comment.parentid, 4) || !comment.comment.trim().length)) {
        isValid = false;
    }
    return isValid;
}
