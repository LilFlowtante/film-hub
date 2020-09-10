import { Component, OnDestroy, OnInit } from '@angular/core';
import { MovieService } from './services/movie.service';
import { Movie } from './models/movie';
import { FormGroup, FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

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
  showMovieDetails: boolean = false;
  showFavoriteMovies: boolean = false;

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
      this.showMovieDetails = false;
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
        this.moviesMessage = movies.Search.length + " film(s)";
        this.movies = movies.Search;
      }
    })
  }

  addToFavoris(movie: Movie) {
    this.favoris.push(movie);
    // On shown movie detail, display delete from favoris ico
    this.movieIsFavorite = true;
    this._snackBar.open(movie.Title + " ajouté aux favoris", "OK", {
      duration: 3000,
    });
  }

  deleteFromFavoris(movie: Movie) {
    this.favoris.forEach((favori: Movie) => {
      if(favori.Title == movie.Title) {
        const index: number = this.favoris.indexOf(favori);
        this.favoris.splice(index, 1);
      }
    })
    // Display add movie to favoris ico
    this.movieIsFavorite = false;
    this._snackBar.open(movie.Title + " supprimé des favoris", "OK", {
      duration: 3000,
    });
  }

  showMovie(title: string) {
    this.movieIsFavorite = false; 
    this.getByTitleSubscription = this.movieService.getByTitle(title)
    .subscribe((movie: Movie) => {
      this.movie = movie;
      this.showSearchMovies = false;
      this.showFavoriteMovies = false;
      this.showMovieDetails = true;
      // Check if movie is favoris and display add/ or delete from favoris ico
      this.favoris.forEach((movie: Movie) => {
        if(movie.Title == title) {
          this.movieIsFavorite = true;
        }
      })
    })
  }

  showFavoris() {
    this.moviesMessage = this.favoris.length + " favoris";
    this.showSearchMovies = false;
    this.showMovieDetails = false;
    this.showFavoriteMovies = true;
  }

  ngOnDestroy() {
    if(this.searchMoviesSubscription != undefined) this.searchMoviesSubscription.unsubscribe();
    if(this.getByTitleSubscription != undefined) this.getByTitleSubscription.unsubscribe();
  }
}
