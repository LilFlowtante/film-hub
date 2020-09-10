import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Movie } from '../models/movie';

@Injectable({
  providedIn: 'root'
})
export class MovieService {

  urlAPI = environment.apiRequest;

  constructor(private http: HttpClient) { }

  getByTitle(title: string): Observable<Movie> {
    return this.http.get<Movie>(`${this.urlAPI}t=${title}`);
  }

  searchMovies(key: string): Observable<Movie[]> {
    return this.http.get<Movie[]>(`${this.urlAPI}s=${key}`);
  }
}
