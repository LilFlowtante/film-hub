import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler } from '@angular/common/http';
import { finalize } from 'rxjs/operators';
import { LoaderService } from './loader.service';

@Injectable({
  providedIn: 'root'
})
export class LoaderInterceptorService {

  private totalRequests = 0;

  constructor(private loadingService: LoaderService) { }

  intercept(request: HttpRequest<any>, next: HttpHandler) {
    this.totalRequests++;
    this.loadingService.isLoading.next(true);

    return next.handle(request).pipe(
      finalize(() => {
        this.totalRequests--;
        if (this.totalRequests === 0) {
          this.loadingService.isLoading.next(false);
        }
      })
    );
  }
}
