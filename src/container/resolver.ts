import { Container, AsyncContainerModule, interfaces } from 'inversify';
import { DBConnection, IDBConnectionSymbol } from '../repository/db/dbContext';
//#region Repository imports
import { CommentRepository, ICommentRepository, ICommentRepositorySymbol } from '../repository/read/commentsRepository';
import { IWriteCommentRepository, IWriteCommentRepositorySymbol, WriteCommentRepository } from '../repository/write/commentRepository';
//#endregion
//#region Services imports
import { CommentService, ICommentService, ICommentServiceSymbol } from '../services/commentServices';
//#endregion
export let IoC: Container = new Container({ skipBaseClassChecks: true, autoBindInjectable: true });
export function RepositoryResolver(): AsyncContainerModule {
    return new AsyncContainerModule(async (bind: interfaces.Bind,
        unbind: interfaces.Unbind,
        isBound: interfaces.IsBound,
        rebind: interfaces.Rebind) => {
        bind<DBConnection>(IDBConnectionSymbol).to(DBConnection);
        bind<ICommentRepository>(ICommentRepositorySymbol).to(CommentRepository).inRequestScope();
        bind<IWriteCommentRepository>(IWriteCommentRepositorySymbol).to(WriteCommentRepository).inRequestScope();
    });
}

export function ServicesResolver(): AsyncContainerModule {
    return new AsyncContainerModule(async (bind: interfaces.Bind,
        unbind: interfaces.Unbind,
        isBound: interfaces.IsBound,
        rebind: interfaces.Rebind) => {
        bind<ICommentService>(ICommentServiceSymbol).to(CommentService).inRequestScope();
    });
}

