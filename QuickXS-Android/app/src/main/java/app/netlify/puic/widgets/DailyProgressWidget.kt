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
import app.netlify.puic.data.SupabaseRepository

class DailyProgressWidget : GlanceAppWidget() {

    override suspend fun provideGlance(context: Context, id: GlanceId) {
        val repository = SupabaseRepository()
        val widgetData = repository.getWidgetData()

        provideContent {
            DailyProgressWidgetContent(
                completedClasses = widgetData.todayProgress.completedClasses,
                totalClasses = widgetData.todayProgress.totalClasses,
                percentage = widgetData.todayProgress.percentage
            )
        }
    }

    @Composable
    private fun DailyProgressWidgetContent(
        completedClasses: Int,
        totalClasses: Int,
        percentage: Int
    ) {
        Column(
            modifier = GlanceModifier
                .fillMaxSize()
                .background(Color(0xFF393E46))
                .padding(16.dp),
            verticalAlignment = Alignment.Vertical.CenterVertically,
            horizontalAlignment = Alignment.Horizontal.CenterHorizontally
        ) {
            Text(
                text = "DAILY PROGRESS",
                style = TextStyle(
                    color = ColorProvider(Color(0xFF00ADB5)),
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold
                )
            )

            Spacer(modifier = GlanceModifier.height(12.dp))

            // Progress Circle (simulated with text)
            Box(
                modifier = GlanceModifier
                    .size(100.dp)
                    .background(Color(0xFF222831)),
                contentAlignment = Alignment.Center
            ) {
                Column(
                    horizontalAlignment = Alignment.Horizontal.CenterHorizontally
                ) {
                    Text(
                        text = "$percentage%",
                        style = TextStyle(
                            color = ColorProvider(Color(0xFF00ADB5)),
                            fontSize = 32.sp,
                            fontWeight = FontWeight.Bold
                        )
                    )
                }
            }

            Spacer(modifier = GlanceModifier.height(12.dp))

            Text(
                text = "$completedClasses / $totalClasses Classes",
                style = TextStyle(
                    color = ColorProvider(Color.White),
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Medium
                )
            )

            Spacer(modifier = GlanceModifier.height(4.dp))

            Text(
                text = if (completedClasses == totalClasses && totalClasses > 0) {
                    "✅ All done!"
                } else if (totalClasses > 0) {
                    "Keep it up!"
                } else {
                    "No classes today"
                },
                style = TextStyle(
                    color = ColorProvider(Color(0xFFB0B0B0)),
                    fontSize = 12.sp
                )
            )
        }
    }
}

class DailyProgressWidgetReceiver : GlanceAppWidgetReceiver() {
    override val glanceAppWidget: GlanceAppWidget = DailyProgressWidget()
}
