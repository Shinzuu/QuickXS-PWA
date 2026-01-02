package app.netlify.puic.data

import app.netlify.puic.BuildConfig
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Date
import java.util.Locale
import java.util.concurrent.TimeUnit

class SupabaseRepository {

    private val api: SupabaseApi

    init {
        val logging = HttpLoggingInterceptor().apply {
            level = if (BuildConfig.DEBUG) {
                HttpLoggingInterceptor.Level.BODY
            } else {
                HttpLoggingInterceptor.Level.NONE
            }
        }

        val client = OkHttpClient.Builder()
            .addInterceptor(logging)
            .addInterceptor { chain ->
                val request = chain.request().newBuilder()
                    .addHeader("apikey", BuildConfig.SUPABASE_ANON_KEY)
                    .addHeader("Authorization", "Bearer ${BuildConfig.SUPABASE_ANON_KEY}")
                    .build()
                chain.proceed(request)
            }
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .build()

        val retrofit = Retrofit.Builder()
            .baseUrl(BuildConfig.SUPABASE_URL)
            .client(client)
            .addConverterFactory(GsonConverterFactory.create())
            .build()

        api = retrofit.create(SupabaseApi::class.java)
    }

    suspend fun getWidgetData(): WidgetData = withContext(Dispatchers.IO) {
        try {
            val routines = api.getRoutines()
            val events = api.getEvents()

            val today = getCurrentDay()
            val todayClasses = routines.filter { it.day == today }.sortedBy { it.time }

            val currentClass = findCurrentClass(todayClasses)
            val nextClass = findNextClass(todayClasses, currentClass != null)

            val progress = calculateDailyProgress(todayClasses)
            val nextEvent = findNextEvent(events)

            WidgetData(
                currentClass = currentClass,
                nextClass = nextClass,
                todayProgress = progress,
                nextEvent = nextEvent
            )
        } catch (e: Exception) {
            e.printStackTrace()
            // Return empty data on error
            WidgetData(
                currentClass = null,
                nextClass = null,
                todayProgress = DailyProgress(0, 0, 0),
                nextEvent = null
            )
        }
    }

    private fun getCurrentDay(): String {
        val days = listOf("Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday")
        val calendar = Calendar.getInstance()
        return days[calendar.get(Calendar.DAY_OF_WEEK) - 1]
    }

    private fun findCurrentClass(classes: List<Routine>): ClassInfo? {
        val now = Calendar.getInstance()
        val currentTime = now.get(Calendar.HOUR_OF_DAY) * 60 + now.get(Calendar.MINUTE)

        for (routine in classes) {
            val (startHour, startMinute) = parseTime(routine.time)
            val startTimeMinutes = startHour * 60 + startMinute
            val endTimeMinutes = startTimeMinutes + routine.duration

            if (currentTime in startTimeMinutes until endTimeMinutes) {
                return ClassInfo(
                    subject = routine.subject,
                    teacher = routine.teacher,
                    classroom = routine.classroom,
                    startTime = routine.time,
                    endTime = formatTime(endTimeMinutes),
                    status = ClassStatus.NOW
                )
            }
        }
        return null
    }

    private fun findNextClass(classes: List<Routine>, hasCurrentClass: Boolean): ClassInfo? {
        if (classes.isEmpty()) return null

        val now = Calendar.getInstance()
        val currentTime = now.get(Calendar.HOUR_OF_DAY) * 60 + now.get(Calendar.MINUTE)

        for (routine in classes) {
            val (startHour, startMinute) = parseTime(routine.time)
            val startTimeMinutes = startHour * 60 + startMinute

            if (startTimeMinutes > currentTime) {
                return ClassInfo(
                    subject = routine.subject,
                    teacher = routine.teacher,
                    classroom = routine.classroom,
                    startTime = routine.time,
                    endTime = formatTime(startTimeMinutes + routine.duration),
                    status = if (hasCurrentClass) ClassStatus.UPCOMING else ClassStatus.NEXT
                )
            }
        }
        return null
    }

    private fun calculateDailyProgress(classes: List<Routine>): DailyProgress {
        if (classes.isEmpty()) {
            return DailyProgress(0, 0, 0)
        }

        val now = Calendar.getInstance()
        val currentTime = now.get(Calendar.HOUR_OF_DAY) * 60 + now.get(Calendar.MINUTE)

        var completed = 0
        for (routine in classes) {
            val (startHour, startMinute) = parseTime(routine.time)
            val endTimeMinutes = startHour * 60 + startMinute + routine.duration

            if (endTimeMinutes <= currentTime) {
                completed++
            }
        }

        val percentage = (completed * 100) / classes.size

        return DailyProgress(
            completedClasses = completed,
            totalClasses = classes.size,
            percentage = percentage
        )
    }

    private fun findNextEvent(events: List<Event>): Event? {
        val today = Calendar.getInstance()
        today.set(Calendar.HOUR_OF_DAY, 0)
        today.set(Calendar.MINUTE, 0)
        today.set(Calendar.SECOND, 0)

        for (event in events) {
            if (event.isCompleted) continue

            try {
                val eventDate = SimpleDateFormat("yyyy-MM-dd", Locale.US).parse(event.date)
                if (eventDate != null && eventDate >= today.time) {
                    return event
                }
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
        return null
    }

    private fun parseTime(time: String): Pair<Int, Int> {
        val parts = time.split(":")
        return Pair(parts[0].toInt(), parts[1].toInt())
    }

    private fun formatTime(minutes: Int): String {
        val hour = minutes / 60
        val minute = minutes % 60
        return String.format("%02d:%02d", hour, minute)
    }
}
