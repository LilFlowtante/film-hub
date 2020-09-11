import { Component, OnDestroy, OnInit } from '@angular/core';
import { MovieService } from './services/movie.service';
import { Movie } from './models/movie';
import { FormGroup, FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { PageEvent } from '@angular/material/paginator';
import { MovieComponent } from './components/movie/movie.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {

  searchMoviesSubscription: Subscription;
  getByTitleSubscription: Subscription;

  moviesMessage: string = "Cherchez des films";
  movies: Movie[] = [];
  favoris: Movie[] = [];

  movie: Movie;
  movieIsFavorite: boolean = false;

  showSearchMovies: boolean = true;
  showFavoriteMovies: boolean = false;

  totalMovieSearchResult: number = 0;
  pageSize: number = 10;

  findMovieForm = new FormGroup({
    key: new FormControl('')
  });

  constructor(private movieService: MovieService,
              private _snackBar: MatSnackBar) {}

  ngOnInit() {
  }

  findMovies() {
    this.searchMoviesSubscription = this.movieService.searchMovies(this.findMovieForm.controls['key'].value)
    .subscribe((movies: any) => {
      this.totalMovieSearchResult = movies.totalResults;
      this.showFavoriteMovies = false;
      this.showSearchMovies = true;
      // Cutsom user message
      if(movies.Error == "Too many results.") {
        this.moviesMessage = "Trop de résultats, affinnez la recherche";
        this.movies = [];
      } else if(movies.Error == "Movie not found!") {
        this.moviesMessage = "Pas de résultats"
        this.movies = [];
      } else {
        this.moviesMessage = movies.totalResults + " film(s) trouvés pour " + '"' + this.findMovieForm.controls['key'].value + '"';
        this.movies = movies.Search;
        // Order by year of release
        this.movies.sort((a: Movie, b: Movie) => { return this.compare(a.Year.toString(), b.Year.toString(), true)});
      }
    })
  }

  pageEvent(page: PageEvent) {
    const index: number = page.pageIndex + 1;
    this.movieService.searchMoviesPages(this.findMovieForm.controls['key'].value, index)
    .subscribe((movies: any) => {
      this.movies = movies.Search;
      // Order by year of release
      this.movies.sort((a: Movie, b: Movie) => { return this.compare(a.Year.toString(), b.Year.toString(), true)});
    })
  }

  addToFavoris(movie: Movie) {
    this.favoris.push(movie);
    // On shown movie detail, display delete from favoris ico
    this.movieIsFavorite = true;
    this._snackBar.open(movie.Title + " ajouté aux favoris", "OK", {
      duration: 3000,
      panelClass: ['snackbar-action']
    });
  }

  deleteFromFavoris(movie: Movie) {
    this.favoris.forEach((favori: Movie) => {
      if(favori.Title == movie.Title) {
        const index: number = this.favoris.indexOf(favori);
        this.favoris.splice(index, 1);
      }
    })
    this.moviesMessage = this.favoris.length + " favoris";
    this.movieIsFavorite = false;
    this._snackBar.open(movie.Title + " supprimé des favoris", "OK", {
      duration: 3000,
      panelClass: ['snackbar-action']
    });
  }

  showMovie() {
    this.showSearchMovies = false;
    this.showFavoriteMovies = false;
  }

  showFavoris() { 
    this.moviesMessage = this.favoris.length + " favoris";
    this.showSearchMovies = false;
    this.showFavoriteMovies = true;
  }

  compare(a: number | string, b: number | string, isAsc: boolean) {
    return (a > b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  ngOnDestroy() {
    if(this.searchMoviesSubscription != undefined) this.searchMoviesSubscription.unsubscribe();
    if(this.getByTitleSubscription != undefined) this.getByTitleSubscription.unsubscribe();
  }
}
