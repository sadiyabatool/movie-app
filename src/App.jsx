import { useEffect, useState } from 'react';
import Search from './components/Search.jsx';
import Spinner from './components/Spinner.jsx';
import MovieCard from './components/MovieCard.jsx';
import TrendingCard from './components/TrendingCard.jsx';
import { useDebounce } from 'react-use';
import { getTrendingMovies, updateSearchCount, account } from './appwrite.js';
import React from 'react';

// Apply persisted theme from localStorage BEFORE React renders
if (
  localStorage.theme === 'dark' ||
  (!('theme' in localStorage) &&
    window.matchMedia('(prefers-color-scheme: dark)').matches)
) {
  document.documentElement.classList.add('dark');
} else {
  document.documentElement.classList.remove('dark');
}


const API_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json'
  }
};

const App = () => {
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [SearchTerm, setSearchTerm] = useState('');
  const [movieList, setMovieList] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [user, setUser] = useState(null);
  const [currentPage,setCurrentPage]=useState(1);
  const [totalPages,setTotalPages]=useState(1);
  const [watchList,setWatchList]=useState([]);
  const [safeMovies, setSafeMovies] = useState([]);

  const SAFE_GENRE_IDS = [
  28,     // Action
  12,     // Adventure
  16,     // Animation
  10751,  // Family
  14,     // Fantasy
  36,     // History
  10402,  // Music
  878,    // Science Fiction
];

  // Debounce the search term to prevent making too many API requests
  useDebounce(() => setDebouncedSearchTerm(SearchTerm), 1000, [SearchTerm]);


  // Handle session with Appwrite
  useEffect(() => {
    account.get()
      .then((res) => {
        console.log("✅ Existing session found:", res);
        setUser(res);
      })
      .catch(() => {
        console.log("⚡ No session found, creating anonymous session...");

        account.createAnonymousSession()
          .then(() => {
            console.log("✅ Anonymous session created");

            return account.get();
          })
          .then((res) => {
            console.log("✅ Connected as:", res);
            setUser(res);
          })
          .catch((err) => {
            console.error("❌ Failed to create session or fetch user:", err);
          });
      });
  }, []);
//Handling Pagination
  const handlePages=(newPage)=>{
    if(newPage<1||newPage>totalPages) 
      return;
    setCurrentPage(newPage);
  };
//Fetching Data From  TMDB API
  const fetchMovies = async (query = '') => {
    setIsLoading(true);
    setErrorMessage('');
   

    try {
      const endpoint = query
        ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}&page=${currentPage}&include_adult=false&api_key=${API_KEY}`
        : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc&page=${currentPage}&api_key=${API_KEY}`;

      const response = await fetch(endpoint, API_OPTIONS);

      if (!response.ok) {
        throw new Error('Failed to fetch movies');
      }
      const data = await response.json();

      if (data.Response === 'False') {
        setErrorMessage(data.Error || 'Failed to fetch movies');
        setMovieList([]);
        return;
      }
//Filtering the fetched movies using genre_id's
      if (data.results){
        const filtered= ( data.results.filter(
          (movie) =>
            movie.genre_ids.length > 0 &&
            movie.genre_ids.every(id => SAFE_GENRE_IDS.includes(id))
        ))
    // setMovieList(data.results || []);
      setSafeMovies(filtered||[]);

    
        console.log(filtered);
        setTotalPages(data.total_pages);
      }
      if (query && data.results.length > 0) {
        await updateSearchCount(query, data.results[0]);
      }
    } catch (error) {
      console.error(`Error fetching movies: ${error}`);
      setErrorMessage('Error fetching movies. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };
  //Implementing search of Trending novies using appwrite
  const loadTrendingMovies = async () => {
    try {
      const movies = await getTrendingMovies();
      setTrendingMovies(movies);
    } catch (error) {
      console.error(`Error fetching trending movies: ${error}`);
    }
  };

useEffect(() => {
  fetchMovies(debouncedSearchTerm);
}, [debouncedSearchTerm,currentPage]);

// ✅ Reset page to 1 when search term changes
useEffect(() => {
  setCurrentPage(1);
}, [debouncedSearchTerm]);


useEffect(() => {
  loadTrendingMovies();
    
}, []);
//Adding and removing movies from watchList
const togglewatchList=((movie)=>{
  if (watchList.some((m)=>m.id===movie.id)){
    setWatchList(watchList.filter((m)=>m.id!=movie.id));
  }
  else{
    setWatchList([...watchList,movie]);
  }

})
//Retreving movies from local storage
useEffect(()=>{
  const storedmovies=localStorage.getItem("watchList");
  if (storedmovies){
    setWatchList(JSON.parse(storedmovies));
  }

  
},[])
//Storing the watchlist in local storage in string format
useEffect(()=>{
  if(watchList.length>0){
    localStorage.setItem("watchList",JSON.stringify(watchList));
  }
},[watchList]);


const [darkMode,setdarkMode]=useState(
  localStorage.theme==="dark"?true:false
);
//Switching from one mode to another
const toggleTheme=()=>{
  const newMode=!darkMode;
  setdarkMode(newMode);
//Saving either of two modes in local storage for mode persistence
  if(newMode){
    document.documentElement.classList.add("dark");
    localStorage.theme="dark";
  }
  else{
    document.documentElement.classList.remove("dark");
    localStorage.theme="light";
  }
};
//Scroll to top function
const scrolltoTop=()=>{
  window.scrollTo({top:0,behaviour:'smooth'})
}
  
  return (
    <>
    <main  className="bg-white dark:bg-primary text-black dark:text-white">
        <header className="mt-1 sm:mt-10 px-5 bg-white dark:bg-primary text-black dark:text-white">
          <img  className="-mt-16 flex justify-center w-[500]px max-w-lg h-auto object-contain mx-auto drop-shadow-md items-center" src="./hero.png" alt="Hero Banner" />
          <h1 className="mx-auto text-center text-5xl font-medium leading-tight tracking-[-1%] sm:text-[64px] sm:leading-[76px] -mt-14">
<span className="bg-gradient-to-r from-indigo-400 to-pink-500 bg-clip-text text-transparent ">Find Movies You'll Enjoy Without the Hassle</span></h1>
          <Search searchTerm={SearchTerm} setSearchTerm={setSearchTerm} />
        </header> 
      

      <section className="relative z-10 px-5 py-12 max-w-7xl mx-auto bg-white dark:bg-primary text-black dark:text-white">
          <h2 className=' -mt-4 font-bold text-2xl mb-4'><br/>All Movies</h2>
          {isLoading ? (
            <div className="flex justify-center items-center min-h-[200px]">
              <Spinner />
            </div>         
          ) : errorMessage ? (
            <p className="text-red-500">{errorMessage}</p>
          ) : (
            <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 items-center justify-center  mt-4">
              {safeMovies.map((movie) => (
                    <li key={movie.id}>
                      <MovieCard movie={movie}  watchList={watchList} togglewatchList={togglewatchList} />
                    </li>
              ))}
            </ul>
          )}

        <h2 className="text-2xl font-bold -mt-4 mb-4"><br></br>Trending Movies</h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 items-center justify-center  gap-5 mt-4">
           {trendingMovies.map((doc) => {
    const movie = {
      title: doc.searchTerm,
      id: doc.movie_id,
      poster_path: doc.poster_url,
      vote_average: doc.vote,
      original_language: doc.language,
      release_date: doc.date,
    };

    return (
      <TrendingCard
        key={movie.id}
        movie={movie}
        watchList={watchList}
        togglewatchList={togglewatchList}
      />
    );
  })}

        </ul>
          <h2 className='font-bold text-2xl -mt-4  mb-4'><br></br> WatchList</h2>
            {watchList.length===0?(<p>No movies saved</p>):(
              <ul className=" grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 items-center justify-center mt-2">
                  {watchList.map((movie,index)=>
                      <li key={movie.id}>
                        <div className="p-5 rounded-2xl bg-zinc-300 dark:bg-zinc-800 text-black dark:text-white">
                        
                          <img   className=" flex gap-5 justify-center items-center rounded-lg h-[400]px w-[100]px" src={
                            movie.poster_path
                            ? `https://image.tmdb.org/t/p/w500/${movie.poster_path}` 
                            : "/No-Movie.png"
                            } 
                            alt={movie.title}
                            />
                          <div className='mt-4'>
                            <h3>{movie.title}</h3>
                            <div className=' mt-2 flex flex-row items-center flex-wrap gap-2'>
                              <div className='flex items-center gap-1'>
                                <img src='Star.png' alt='Star.icon' />
                                <p>{movie.vote_average?(movie.vote_average.toFixed(1)):'N/A'}</p>  
                              </div>
                          <span>•</span>
                          <p className='lang'>{movie.original_language}</p>
                          <span>•</span>
                          <p className='year'>{movie.release_date?movie.release_date.split('-')[0]:'N/A'}</p>
                          <button onClick={()=>togglewatchList(movie)}>
                        {watchList.some((m)=>m.id===movie.id)?'❤️':'🤍'}
                      </button>
                              </div>
                            </div>
                          </div>
                      </li>)}
          </ul>)}
        </section>
        <center>
        <button className=" px-2 py-1 mt-4  bg-gray-500 active:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-white rounded mx-[90]px" onClick={()=>handlePages(currentPage-1)}>❮</button>
        <span className="text-gray-700 font-medium text-align-center" >  Page {currentPage} of {totalPages} </span>
        <button className="px-2 py-1 mt-4 bg-gray-500  focus:outline-none focus:ring-2 focus:ring-white active:bg-blue-500 rounded mx-[90]px" onClick={()=>handlePages(currentPage+1)}>❯</button>
        </center>
         <br/>
         <footer className="mt-10 py-4 text-center text-sm text-zinc-600 dark:text-zinc-400 border-t border-gray-200 dark:border-gray-700">
           © 2025 <span className="font-semibold text-indigo-500">Sadiya Batool</span> | Built with TMDB API
          </footer>
         </main>
         <div className='flex justify-end '>
            <button onClick={toggleTheme} className= "fixed top-6 -right-44 z-50 -mt-2  mr-48 w-[10]px bg-purple-400 dark:bg-purple-300 rounded h-8 text-base px-2 py-1 "> { darkMode?" Light Mode":"Dark Mode"}</button>
          </div>
          <div className='flex justify-end '>
            <button onClick={scrolltoTop} className= "fixed bottom-6 -right-44 z-50 -mb-3 mr-48 w-[10]px bg-pink-200 dark:bg-purple-300 rounded h-8 text-base px-2 py-1 ">⬆</button>
          </div>
          </>
  );

};
export default App;

