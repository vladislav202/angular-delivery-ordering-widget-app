import { HttpClient, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpXsrfTokenExtractor } from '@angular/common/http';
import { Inject, Injectable, InjectionToken } from '@angular/core';
import { defer, Observable, of } from 'rxjs';
import { environment } from '@environments/environment';
import { UntilDestroy } from '@ngneat/until-destroy';
import { flatMap } from 'rxjs/operators';

export const XSRF_HEADER_NAME = new InjectionToken<string>('XSRF_HEADER_NAME');

// https://github.com/angular/angular/issues/18859
@UntilDestroy({ arrayName: 'subscriptions' })
@Injectable()
export class XsrfInterceptor implements HttpInterceptor {

  private readonly subscriptions = [];

  constructor(@Inject(XSRF_HEADER_NAME) private headerName: string,
              private tokenExtractor: HttpXsrfTokenExtractor,
              private http: HttpClient) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return defer(
      () => {
        const requestMethod = req.method.toLowerCase();
        if (requestMethod && (requestMethod === 'post' || requestMethod === 'delete' || requestMethod === 'put')) {
          return of(this.tokenExtractor.getToken())
            .pipe(
              flatMap(token => {
                if (token == null) {
                  return this.http.options(environment.api.url, { observe: 'response' })
                    .pipe(flatMap(() => of(this.tokenExtractor.getToken())))
                }
                return of(token)
              }),
              flatMap(token => {
                if (token !== null && !req.headers.has(this.headerName)) {
                  req = req.clone({ withCredentials: true, headers: req.headers.set(this.headerName, token) });
                }
                return next.handle(req);
              })
            )
        }

        return next.handle(req);
      })
  }
}
