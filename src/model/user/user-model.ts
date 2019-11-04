import { IBaseIdentityComment } from "../comment";

export interface IUserModel {
    userid: string;
    firstName: string;
    middleName: string;
    lastName: string;
    email: string;
    username: string;
}

export interface ICommentAll extends IBaseIdentityComment {
    name: string;
    username: string;
    email: string;
}