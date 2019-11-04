export interface IComment {
    userid: string;
    comment: string;
    parentid?: string;
    replyCount?: number;
}