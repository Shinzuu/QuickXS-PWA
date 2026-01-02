package app.netlify.puic.data

import com.google.gson.annotations.SerializedName

// Data models matching your Supabase schema

data class Routine(
    @SerializedName("id") val id: Int,
    @SerializedName("day") val day: String,
    @SerializedName("time") val time: String,
    @SerializedName("subject") val subject: String,
    @SerializedName("teacher") val teacher: String?,
    @SerializedName("classroom") val classroom: String?,
    @SerializedName("duration") val duration: Int = 60,
    @SerializedName("class_type") val classType: String? = null
)

data class Event(
    @SerializedName("id") val id: Int,
    @SerializedName("name") val name: String,
    @SerializedName("date") val date: String,
    @SerializedName("time") val time: String,
    @SerializedName("event_type") val eventType: String,
    @SerializedName("info") val info: String?,
    @SerializedName("is_completed") val isCompleted: Boolean = false,
    @SerializedName("priority") val priority: String? = null
)

data class Link(
    @SerializedName("id") val id: Int,
    @SerializedName("name") val name: String,
    @SerializedName("url") val url: String,
    @SerializedName("category") val category: String?
)

// Widget data models
data class WidgetData(
    val currentClass: ClassInfo?,
    val nextClass: ClassInfo?,
    val todayProgress: DailyProgress,
    val nextEvent: Event?
)

data class ClassInfo(
    val subject: String,
    val teacher: String?,
    val classroom: String?,
    val startTime: String,
    val endTime: String,
    val status: ClassStatus
)

enum class ClassStatus {
    NOW,
    NEXT,
    UPCOMING,
    COMPLETED
}

data class DailyProgress(
    val completedClasses: Int,
    val totalClasses: Int,
    val percentage: Int
)
