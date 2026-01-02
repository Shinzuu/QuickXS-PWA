package app.netlify.puic.widgets

import android.content.Context
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.glance.GlanceId
import androidx.glance.GlanceModifier
import androidx.glance.Image
import androidx.glance.ImageProvider
import androidx.glance.action.clickable
import androidx.glance.appwidget.GlanceAppWidget
import androidx.glance.appwidget.GlanceAppWidgetReceiver
import androidx.glance.appwidget.provideContent
import androidx.glance.background
import androidx.glance.layout.*
import androidx.glance.text.FontWeight
import androidx.glance.text.Text
import androidx.glance.text.TextStyle
import androidx.glance.unit.ColorProvider
import app.netlify.puic.R
import app.netlify.puic.data.ClassStatus
import app.netlify.puic.data.SupabaseRepository
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class CurrentClassWidget : GlanceAppWidget() {

    override suspend fun provideGlance(context: Context, id: GlanceId) {
        val repository = SupabaseRepository()
        val widgetData = repository.getWidgetData()

        provideContent {
            CurrentClassWidgetContent(
                currentClass = widgetData.currentClass,
                nextClass = widgetData.nextClass
            )
        }
    }

    @Composable
    private fun CurrentClassWidgetContent(
        currentClass: app.netlify.puic.data.ClassInfo?,
        nextClass: app.netlify.puic.data.ClassInfo?
    ) {
        Column(
            modifier = GlanceModifier
                .fillMaxSize()
                .background(Color(0xFF393E46))
                .padding(16.dp),
            verticalAlignment = Alignment.Vertical.CenterVertically,
            horizontalAlignment = Alignment.Horizontal.CenterHorizontally
        ) {
            if (currentClass != null) {
                // Current Class Display
                Text(
                    text = "NOW",
                    style = TextStyle(
                        color = ColorProvider(Color(0xFF00ADB5)),
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold
                    )
                )

                Spacer(modifier = GlanceModifier.height(8.dp))

                Text(
                    text = currentClass.subject,
                    style = TextStyle(
                        color = ColorProvider(Color.White),
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Bold
                    )
                )

                currentClass.teacher?.let {
                    Spacer(modifier = GlanceModifier.height(4.dp))
                    Text(
                        text = "👨‍🏫 $it",
                        style = TextStyle(
                            color = ColorProvider(Color(0xFFEEEEEE)),
                            fontSize = 14.sp
                        )
                    )
                }

                currentClass.classroom?.let {
                    Text(
                        text = "📍 Room $it",
                        style = TextStyle(
                            color = ColorProvider(Color(0xFFEEEEEE)),
                            fontSize = 14.sp
                        )
                    )
                }

                Spacer(modifier = GlanceModifier.height(8.dp))

                Text(
                    text = "${currentClass.startTime} - ${currentClass.endTime}",
                    style = TextStyle(
                        color = ColorProvider(Color(0xFFB0B0B0)),
                        fontSize = 12.sp
                    )
                )

                // Show next class if available
                if (nextClass != null) {
                    Spacer(modifier = GlanceModifier.height(16.dp))

                    Row(
                        modifier = GlanceModifier.fillMaxWidth(),
                        verticalAlignment = Alignment.Vertical.CenterVertically
                    ) {
                        Box(
                            modifier = GlanceModifier
                                .width(2.dp)
                                .height(20.dp)
                                .background(Color(0xFF00ADB5))
                        )

                        Spacer(modifier = GlanceModifier.width(8.dp))

                        Column {
                            Text(
                                text = "NEXT",
                                style = TextStyle(
                                    color = ColorProvider(Color(0xFF00ADB5)),
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.Bold
                                )
                            )
                            Text(
                                text = nextClass.subject,
                                style = TextStyle(
                                    color = ColorProvider(Color(0xFFEEEEEE)),
                                    fontSize = 14.sp,
                                    fontWeight = FontWeight.Medium
                                )
                            )
                            Text(
                                text = nextClass.startTime,
                                style = TextStyle(
                                    color = ColorProvider(Color(0xFFB0B0B0)),
                                    fontSize = 11.sp
                                )
                            )
                        }
                    }
                }
            } else if (nextClass != null) {
                // Only Next Class Display
                Text(
                    text = "NEXT CLASS",
                    style = TextStyle(
                        color = ColorProvider(Color(0xFF00ADB5)),
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold
                    )
                )

                Spacer(modifier = GlanceModifier.height(8.dp))

                Text(
                    text = nextClass.subject,
                    style = TextStyle(
                        color = ColorProvider(Color.White),
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Bold
                    )
                )

                nextClass.teacher?.let {
                    Spacer(modifier = GlanceModifier.height(4.dp))
                    Text(
                        text = "👨‍🏫 $it",
                        style = TextStyle(
                            color = ColorProvider(Color(0xFFEEEEEE)),
                            fontSize = 14.sp
                        )
                    )
                }

                nextClass.classroom?.let {
                    Text(
                        text = "📍 Room $it",
                        style = TextStyle(
                            color = ColorProvider(Color(0xFFEEEEEE)),
                            fontSize = 14.sp
                        )
                    )
                }

                Spacer(modifier = GlanceModifier.height(8.dp))

                Text(
                    text = nextClass.startTime,
                    style = TextStyle(
                        color = ColorProvider(Color(0xFFB0B0B0)),
                        fontSize = 12.sp
                    )
                )
            } else {
                // No Classes
                Text(
                    text = "🎉",
                    style = TextStyle(fontSize = 48.sp)
                )

                Spacer(modifier = GlanceModifier.height(8.dp))

                Text(
                    text = "No Classes Today",
                    style = TextStyle(
                        color = ColorProvider(Color.White),
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold
                    )
                )

                Spacer(modifier = GlanceModifier.height(4.dp))

                Text(
                    text = "Enjoy your day!",
                    style = TextStyle(
                        color = ColorProvider(Color(0xFFB0B0B0)),
                        fontSize = 14.sp
                    )
                )
            }
        }
    }
}

class CurrentClassWidgetReceiver : GlanceAppWidgetReceiver() {
    override val glanceAppWidget: GlanceAppWidget = CurrentClassWidget()
}
