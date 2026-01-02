package app.netlify.puic.data

import retrofit2.http.GET
import retrofit2.http.Headers

interface SupabaseApi {

    @Headers("apikey: ${BuildConfig.SUPABASE_ANON_KEY}")
    @GET("rest/v1/routines?select=*")
    suspend fun getRoutines(): List<Routine>

    @Headers("apikey: ${BuildConfig.SUPABASE_ANON_KEY}")
    @GET("rest/v1/events?select=*&order=date.asc")
    suspend fun getEvents(): List<Event>

    @Headers("apikey: ${BuildConfig.SUPABASE_ANON_KEY}")
    @GET("rest/v1/links?select=*")
    suspend fun getLinks(): List<Link>
}
