const body = document.querySelector('body');
const btnTheme = document.querySelector('.btn-theme');
const themeObject = {
    light: {
        btnImg: './assets/light-mode.svg',
        background_color: '#FFF',
        input_border_color: '#979797',
        color: '#000',
        shadow_color: '0px 4px 8px rgba(0, 0, 0, 0.15)',
        highlight_background: '#FFF',
        highlight_color: '#000',
        highlight_description: '#000'
    },
    dark: {
        btnImg: './assets/dark-mode.svg',
        background_color: '#242424',
        input_border_color: '#FFF',
        color: '#FFF',
        shadow_color: '0px 4px 8px rgba(255, 255, 255, 0.15)',
        highlight_background: '#454545',
        highlight_color: '#FFF',
        highlight_description: '#FFF'
    },
    set: (theme) => {
        btnTheme.src = themeObject[theme].btnImg;
        body.style.setProperty('--background-color', themeObject[theme].background_color);
        body.style.setProperty('--input-border-color', themeObject[theme].input_border_color);
        body.style.setProperty('--color', themeObject[theme].color);
        body.style.setProperty('--shadow-color', themeObject[theme].shadow_color);
        body.style.setProperty('--highlight-background', themeObject[theme].highlight_background);
        body.style.setProperty('--highlight-color', themeObject[theme].highlight_color);
        body.style.setProperty('--highlight-description', themeObject[theme].highlight_description);
    }
};

let theme = localStorage.getItem('theme') ? localStorage.getItem('theme') : 'light';
themeObject.set(theme);
btnTheme.addEventListener('click', () => {
    theme = theme === 'light' ? 'dark' : 'light'
    localStorage.setItem('theme', theme);
    themeObject.set(theme);
});

const openMovieModal = async (id) => {
    const modal = document.querySelector('.modal');
    const modalImg = document.querySelector('.modal__img');

    fetch(`https://tmdb-proxy.cubos-academy.workers.dev/3/movie/${id}?language=pt-BR`).then(response => {
        const promiseBody = response.json();
        promiseBody.then(movie => {
            const modalTitle = document.querySelector('.modal__title');
            modalTitle.textContent = movie.title;

            modalImg.src = movie.backdrop_path;

            const modalDescription = document.querySelector('.modal__description');
            modalDescription.textContent = movie.overview;

            const modalAverage = document.querySelector('.modal__average');
            modalAverage.textContent = movie.vote_average.toFixed(1);

            if (document.querySelector('.modal__genre')) {
                document.querySelectorAll('.modal__genre').forEach((element) => {
                    element.outerHTML = "";
                });
            }
            movie.genres.forEach((genero) => {
                const elementoGenero = document.createElement('span');
                elementoGenero.classList.add('modal__genre');
                elementoGenero.textContent = genero.name;
                document.querySelector('.modal__genres').append(elementoGenero);
            });
            modal.classList = 'modal';
        });
    });

    const btnModalClose = document.querySelector('.modal__close');
    btnModalClose.addEventListener('click', () => modal.classList = 'modal hidden');
};

const createMovieElements = (movie) => {
    const elementMovies = document.querySelector('.movies');
    const elementMovie = document.createElement('div');
    elementMovie.classList.add('movie');
    elementMovie.style.setProperty('background-image', `url(${movie.poster_path})`);

    const elementMovieInfo = document.createElement('div');
    elementMovieInfo.classList.add('movie__info');

    const elementMovieTitle = document.createElement('span');
    elementMovieTitle.classList.add('movie__title');
    elementMovieTitle.textContent = movie.title;

    const elementMovieRating = document.createElement('span');
    elementMovieRating.classList.add('movie__rating');

    const imageMovieStar = document.createElement('img');
    imageMovieStar.src = "./assets/estrela.svg";
    imageMovieStar.alt = "Estrela";

    const elementVoteAvarage = document.createElement('p');
    elementVoteAvarage.textContent = movie.vote_average;

    elementMovieRating.style.display = 'flex';
    elementMovieRating.style.justifyContent = 'row';
    elementMovieRating.style.gap = '3px';

    elementMovie.addEventListener('click', () => openMovieModal(movie.id));

    elementMovies.append(elementMovie);
    elementMovie.append(elementMovieInfo);
    elementMovieInfo.append(elementMovieTitle, elementMovieRating);
    elementMovieRating.append(imageMovieStar, elementVoteAvarage);
};

const deleteMoviesElements = () => {
    const elementsMovie = document.querySelectorAll('.movie');
    elementsMovie.forEach(element => element.outerHTML = '');
}

const objectMoviesAPI = {
    topMovies: null,
    searchedMovies: null,
    maxOffset: () => {
        return objectMoviesAPI.searchedMovies ? objectMoviesAPI.searchedMovies.length - 5 : objectMoviesAPI.topMovies.length - 5;
    },
    getTopMovies: async () => {
        await fetch('https://tmdb-proxy.cubos-academy.workers.dev/3/discover/movie?language=pt-BR&include_adult=false')
            .then(response => response.json())
            .then(data => objectMoviesAPI.topMovies = data.results);
    },
    getFiveMovies: async (limit, offset) => {
        if (!objectMoviesAPI.topMovies) await objectMoviesAPI.getTopMovies();

        movies = objectMoviesAPI.searchedMovies ? objectMoviesAPI.searchedMovies : objectMoviesAPI.topMovies;
        return movies.slice(offset, offset + limit);
    },
    searchMovies: async (serchValue) => {
        if (serchValue != '') {
            await fetch(`https://tmdb-proxy.cubos-academy.workers.dev/3/search/movie?language=pt-BR&include_adult=false` + `&query=${serchValue}`)
                .then(response => response.json())
                .then(data => objectMoviesAPI.searchedMovies = data.results);
        }
        else objectMoviesAPI.searchedMovies = null;
    }
}

const loadCarousel = async (movies) => {
    deleteMoviesElements();
    movies.forEach(movie => createMovieElements(movie));
}

const loadFirstPage = async () => {
    let offset = 0;
    let limit = 5;
    let movies = objectMoviesAPI.getFiveMovies(limit, offset);

    movies.then(movies => loadCarousel(movies));
}

const searchArea = document.querySelector('.input');
searchArea.addEventListener('keydown', async (event) => {
    if (event.code === 'Enter') {
        await objectMoviesAPI.searchMovies(searchArea.value)
        searchArea.value = '';
        loadFirstPage();
    }
});

let offset = 0;
let limit = 5;

loadFirstPage();
const btnPrev = document.querySelector('.btn-prev');
const btnNext = document.querySelector('.btn-next');

btnPrev.addEventListener('click', (event) => {
    offset -= 5;
    if (offset < 0) offset = objectMoviesAPI.maxOffset();

    let movies = objectMoviesAPI.getFiveMovies(limit, offset);
    movies.then(movies => loadCarousel(movies));
});

btnNext.addEventListener('click', (event) => {
    offset += 5;
    if (offset > objectMoviesAPI.maxOffset()) offset = 0;

    let movies = objectMoviesAPI.getFiveMovies(limit, offset);
    movies.then(movies => loadCarousel(movies));
});

const highlight = {
    movie: fetch('https://tmdb-proxy.cubos-academy.workers.dev/3/movie/436969?language=pt-BR')
        .then(response => response.json())
        .then(movie => {
            const highlightVideo = document.querySelector('.highlight__video');
            highlightVideo.style.setProperty('background-image', `url(${movie.backdrop_path})`);

            const highlightTitle = document.querySelector('.highlight__title');
            highlightTitle.textContent = movie.title;

            const highlightRating = document.querySelector('.highlight__rating');
            highlightRating.textContent = movie.vote_average.toFixed(1);

            const highlightGenres = document.querySelector('.highlight__genres');
            let generos = [];
            for (let genero of movie.genres) generos.push(genero.name);
            highlightGenres.textContent = generos.join(', ');

            const highlightLaunch = document.querySelector('.highlight__launch');
            highlightLaunch.textContent = new Date(movie.release_date).toLocaleDateString('pt-br', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'utc' });

            const highlightDescription = document.querySelector('.highlight__description');
            highlightDescription.textContent = movie.overview;
        }),
    video: fetch('https://tmdb-proxy.cubos-academy.workers.dev/3/movie/436969/videos?language=pt-BR')
        .then(response => response.json())
        .then(videos => {
            const highlightVideoLink = document.querySelector('.highlight__video-link');
            highlightVideoLink.href = 'https://www.youtube.com/watch?v=' + videos.results[1].key;
        })
}