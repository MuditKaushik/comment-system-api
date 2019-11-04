import { IUserModel } from '../user';
import { IBaseIdentityComment } from './baseIdentityComment';
export interface IUserComments {
    user: IUserModel;
    comments: Array<IBaseIdentityComment>;
}
