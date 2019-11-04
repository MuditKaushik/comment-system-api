import { throwError, Observable } from 'rxjs';
import { ICustomError } from '../model/error';

export function errorhandler(err: any): Observable<any> {
    console.debug('actual error is', err);
    let customError: ICustomError =
    {
        error: {
            message: 'An error occured while procressing your request.',
            name: err.name
        },
        status: 500
    };
    return throwError(customError);
}
