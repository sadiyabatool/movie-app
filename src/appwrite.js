import {Client,Databases,Account,ID,Query} from 'appwrite'

const DATABASE_ID=import.meta.env.VITE_APPWRITE_MOVIE_DATABASE_ID;
const COLLECTION_ID=import.meta.env.VITE_APPWRITE_METRICS_COLLECTION_ID;
const PROJECT_ID=import.meta.env.VITE_APPWRITE_PROJECT_ID;
const client=new Client();
const endpoint = import.meta.env.VITE_APPWRITE_ENDPOINT || 'FALLBACK_NOT_FOUND';
console.log("🔍 Endpoint is:", import.meta.env.VITE_APPWRITE_ENDPOINT);

client.setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)
.setProject(PROJECT_ID);

const database=new Databases(client);
export const account=new Account(client);
console.log("✅ ENDPOINT:", import.meta.env.VITE_APPWRITE_ENDPOINT);

console.log("ENV Vars:", import.meta.env);

export const updateSearchCount=async (searchTerm,movie) => {
    try{
        const result=await database.listDocuments(DATABASE_ID,COLLECTION_ID,[Query.equal('searchTerm',searchTerm)])
        console.log("About to CREATE:", {
  searchTerm,
  movie_id: movie?.id,
  poster: movie?.poster_path,
  vote: movie?.vote_average,
  lang: movie?.original_language,
  date: movie.release_date?movie.release_date.split('-')[0]:'NA',
});
        if (result.documents.length>0){
            const doc=result.documents[0];

            await database.updateDocument(DATABASE_ID,COLLECTION_ID,doc.$id,{count:doc.count+1,})
        } else{
            console.log("Movie object at create time:", movie);

            await database.createDocument(DATABASE_ID,COLLECTION_ID,ID.unique(),{
                searchTerm,
                count:1,
                movie_id:movie.id,
                poster_url:`https://image.tmdb.org/t/p/w500${movie.poster_path}`,
                vote:movie.vote_average,
                language:movie.original_language,
                date:movie.release_date?movie.release_date.split('-')[0]:'NA',
                
            })
        }
    }catch(error){
        console.error(error);
    }
 
}
export const getTrendingMovies=async () => {
    try{
    const result=await database.listDocuments(DATABASE_ID,COLLECTION_ID,[Query.limit(5),
            Query.orderDesc("count")
    ])
    return result.documents;
    }catch(error){
    console.error(error);
    }
    
}
