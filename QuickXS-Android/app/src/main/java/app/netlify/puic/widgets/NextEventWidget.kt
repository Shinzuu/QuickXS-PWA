package app.netlify.puic.widgets

import android.content.Context
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.glance.GlanceId
import androidx.glance.GlanceModifier
import androidx.glance.appwidget.GlanceAppWidget
import androidx.glance.appwidget.GlanceAppWidgetReceiver
import androidx.glance.appwidget.provideContent
import androidx.glance.background
import androidx.glance.layout.*
import androidx.glance.text.FontWeight
import androidx.glance.text.Text
import androidx.glance.text.TextStyle
import androidx.glance.unit.ColorProvider
import app.netlify.puic.data.Event
import app.netlify.puic.data.SupabaseRepository
import java.text.SimpleDateFormat
import java.util.*

class NextEventWidget : GlanceAppWidget() {

    override suspend fun provideGlance(context: Context, id: GlanceId) {
        val repository = SupabaseRepository()
        val widgetData = repository.getWidgetData()

        provideContent {
            NextEventWidgetContent(event = widgetData.nextEvent)
        }
    }

    @Composable
    private fun NextEventWidgetContent(event: Event?) {
        Column(
            modifier = GlanceModifier
                .fillMaxSize()
                .background(Color(0xFF393E46))
                .padding(16.dp),
            verticalAlignment = Alignment.Vertical.CenterVertically
        ) {
            if (event != null) {
                Row(
                    modifier = GlanceModifier.fillMaxWidth(),
                    verticalAlignment = Alignment.Vertical.CenterVertically
                ) {
                    Text(
                        text = getEventIcon(event.eventType),
                        style = TextStyle(fontSize = 32.sp)
                    )

                    Spacer(modifier = GlanceModifier.width(12.dp))

                    Column(modifier = GlanceModifier.defaultWeight()) {
                        Text(
                            text = event.eventType.uppercase(),
                            style = TextStyle(
                                color = ColorProvider(Color(0xFF00ADB5)),
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Bold
                            )
                        )

                        Spacer(modifier = GlanceModifier.height(4.dp))

                        Text(
                            text = event.name,
                            style = TextStyle(
                                color = ColorProvider(Color.White),
                                fontSize = 16.sp,
                                fontWeight = FontWeight.Bold
                            ),
                            maxLines = 2
                        )

                        Spacer(modifier = GlanceModifier.height(4.dp))

                        Text(
                            text = formatEventDate(event.date),
                            style = TextStyle(
                                color = ColorProvider(Color(0xFFEEEEEE)),
                                fontSize = 12.sp
                            )
                        )

                        Text(
                            text = formatTime(event.time),
                            style = TextStyle(
                                color = ColorProvider(Color(0xFFB0B0B0)),
                                fontSize = 11.sp
                            )
                        )

                        event.info?.let { info ->
                            if (info.isNotBlank()) {
                                Spacer(modifier = GlanceModifier.height(4.dp))
                                Text(
                                    text = info,
                                    style = TextStyle(
                                        color = ColorProvider(Color(0xFFB0B0B0)),
                                        fontSize = 10.sp
                                    ),
                                    maxLines = 2
                                )
                            }
                        }
                    }
                }

                Spacer(modifier = GlanceModifier.height(8.dp))

                val daysUntil = calculateDaysUntil(event.date)
                Box(
                    modifier = GlanceModifier
                        .fillMaxWidth()
                        .background(
                            if (daysUntil < 2) Color(0xFFFF6B6B) else Color(0xFF00ADB5)
                        )
                        .padding(8.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = when {
                            daysUntil == 0 -> "TODAY"
                            daysUntil == 1 -> "TOMORROW"
                            daysUntil < 7 -> "IN $daysUntil DAYS"
                            else -> "IN ${daysUntil / 7} WEEKS"
                        },
                        style = TextStyle(
                            color = ColorProvider(Color.White),
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold
                        )
                    )
                }
            } else {
                Column(
                    modifier = GlanceModifier.fillMaxSize(),
                    verticalAlignment = Alignment.Vertical.CenterVertically,
                    horizontalAlignment = Alignment.Horizontal.CenterHorizontally
                ) {
                    Text(
                        text = "✨",
                        style = TextStyle(fontSize = 48.sp)
                    )

                    Spacer(modifier = GlanceModifier.height(8.dp))

                    Text(
                        text = "No Upcoming Events",
                        style = TextStyle(
                            color = ColorProvider(Color.White),
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold
                        )
                    )

                    Spacer(modifier = GlanceModifier.height(4.dp))

                    Text(
                        text = "Enjoy your free time!",
                        style = TextStyle(
                            color = ColorProvider(Color(0xFFB0B0B0)),
                            fontSize = 12.sp
                        )
                    )
                }
            }
        }
    }

    private fun getEventIcon(eventType: String): String {
        return when (eventType.uppercase()) {
            "CT" -> "📝"
            "MID" -> "📘"
            "ASSIGNMENT" -> "📋"
            "LAB" -> "🔬"
            "SUBMISSION" -> "📤"
            "ANNOUNCEMENT" -> "📢"
            else -> "📌"
        }
    }

    private fun formatEventDate(dateString: String): String {
        return try {
            val inputFormat = SimpleDateFormat("yyyy-MM-dd", Locale.US)
            val date = inputFormat.parse(dateString)
            val outputFormat = SimpleDateFormat("EEE, MMM d, yyyy", Locale.US)
            outputFormat.format(date ?: Date())
        } catch (e: Exception) {
            dateString
        }
    }

    private fun formatTime(time: String): String {
        return try {
            val parts = time.split(":")
            val hour = parts[0].toInt()
            val minute = parts[1].toInt()
            val amPm = if (hour >= 12) "PM" else "AM"
            val displayHour = if (hour > 12) hour - 12 else if (hour == 0) 12 else hour
            "$displayHour:${String.format("%02d", minute)} $amPm"
        } catch (e: Exception) {
            time
        }
    }

    private fun calculateDaysUntil(dateString: String): Int {
        return try {
            val format = SimpleDateFormat("yyyy-MM-dd", Locale.US)
            val eventDate = format.parse(dateString)
            val today = Calendar.getInstance()
            today.set(Calendar.HOUR_OF_DAY, 0)
            today.set(Calendar.MINUTE, 0)
            today.set(Calendar.SECOND, 0)
            today.set(Calendar.MILLISECOND, 0)

            if (eventDate != null) {
                val diff = eventDate.time - today.timeInMillis
                (diff / (1000 * 60 * 60 * 24)).toInt()
            } else {
                0
            }
        } catch (e: Exception) {
            0
        }
    }
}

class NextEventWidgetReceiver : GlanceAppWidgetReceiver() {
    override val glanceAppWidget: GlanceAppWidget = NextEventWidget()
}
