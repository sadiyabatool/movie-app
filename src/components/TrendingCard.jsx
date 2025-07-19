import React from 'react';

const TrendingCard = ({
  movie,
  movie: { title, vote_average, poster_path, release_date, original_language },
  togglewatchList,
  watchList,
}) => {
  return (
    <div className="p-5 rounded-2xl bg-zinc-300 dark:bg-zinc-800 text-black dark:text-white">
      <img
        src={poster_path ? `https://image.tmdb.org/t/p/w500/${poster_path}` : '/No-Movie.png'}
        alt={title}
        className=" flex gap-5 justify-center items-center rounded-lg h-[400]px w-[100]px"
      />
      <div className="mt-4">
        <h3 className="font-bold text-base line-clamp-1">{title}</h3>
        <div className="mt-2 flex items-center flex-wrap gap-2">
          <div className="flex items-center gap-1">
            <img src="Star.png" alt="Star Icon" className="object-contain" />
            <p className="font-medium text-base">{vote_average ? vote_average.toFixed(1) : 'N/A'}</p>
          </div>
          <span>•</span>
          <p className="font-medium text-base">{original_language}</p>
          <span>•</span>
          <p className="font-medium text-base">
            {release_date ? release_date.split('-')[0] : 'N/A'}
          </p>
          <button onClick={() => togglewatchList(movie)}>
            {watchList.some((m) => m.id === movie.id) ? '❤️' : '🤍'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrendingCard;
