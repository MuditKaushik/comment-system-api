import { IComment } from './comment';
export interface IBaseIdentityComment extends IComment {
    commentid: string;
    datetime: string;
}
