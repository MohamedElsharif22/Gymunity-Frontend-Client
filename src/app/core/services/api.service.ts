import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

/**
 * API Service
 * Centralized service for all HTTP API calls
 * All requests automatically get the auth token via the authInterceptor
 */
@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = (environment as any).apiUrl;

  get<T>(endpoint: string, params?: HttpParams | Record<string, any>): Observable<T> {
    let httpParams = params instanceof HttpParams ? params : new HttpParams();

    if (params && !(params instanceof HttpParams)) {
      Object.keys(params).forEach(key => {
        httpParams = httpParams.set(key, params[key]);
      });
    }

    console.log('[ApiService] GET request:', `${this.apiUrl}${endpoint}`);
    return this.http.get<T>(`${this.apiUrl}${endpoint}`, { params: httpParams });
  }

  post<T>(endpoint: string, body: any): Observable<T> {
    console.log('[ApiService] POST request:', `${this.apiUrl}${endpoint}`, { bodyKeys: Object.keys(body || {}) });
    return this.http.post<T>(`${this.apiUrl}${endpoint}`, body);
  }

  put<T>(endpoint: string, body: any): Observable<T> {
    console.log('[ApiService] PUT request:', `${this.apiUrl}${endpoint}`, { bodyKeys: Object.keys(body || {}) });
    return this.http.put<T>(`${this.apiUrl}${endpoint}`, body);
  }

  patch<T>(endpoint: string, body: any): Observable<T> {
    console.log('[ApiService] PATCH request:', `${this.apiUrl}${endpoint}`, { bodyKeys: Object.keys(body || {}) });
    return this.http.patch<T>(`${this.apiUrl}${endpoint}`, body);
  }

  delete<T>(endpoint: string): Observable<T> {
    console.log('[ApiService] DELETE request:', `${this.apiUrl}${endpoint}`);
    return this.http.delete<T>(`${this.apiUrl}${endpoint}`);
  }

  postFormData<T>(endpoint: string, formData: FormData): Observable<T> {
    console.log('[ApiService] POST FormData request:', `${this.apiUrl}${endpoint}`);
    return this.http.post<T>(`${this.apiUrl}${endpoint}`, formData);
  }
}
