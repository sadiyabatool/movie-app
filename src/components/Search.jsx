import React from 'react';

const Search = ({ SearchTerm, setSearchTerm }) => {
  return (
    <div className="w-full px-4 py-3 h-18 rounded-full mt-10 max-w-3xl mx-auto">
      <div className="relative flex items-center">
        <img src="search.svg" alt="search" className="absolute left-2 h-5 w-5" />
        <input
          type="text"
          placeholder="Search through thousands of movies"
          value={SearchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full py-2 sm:pr-10 pl-10 text-base 
                     bg-white text-black caret-black 
                     dark:bg-gray-800 dark:text-white dark:caret-white 
                     placeholder-gray-500 dark:placeholder-gray-400 
                     rounded-md border border-gray-300 dark:border-gray-600 
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
};

export default Search;
