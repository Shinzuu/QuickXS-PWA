package app.netlify.puic.workers

import android.content.Context
import androidx.glance.appwidget.updateAll
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import app.netlify.puic.widgets.CurrentClassWidget
import app.netlify.puic.widgets.DailyProgressWidget
import app.netlify.puic.widgets.NextEventWidget

class WidgetUpdateWorker(
    context: Context,
    params: WorkerParameters
) : CoroutineWorker(context, params) {

    override suspend fun doWork(): Result {
        return try {
            // Update all widgets
            CurrentClassWidget().updateAll(applicationContext)
            DailyProgressWidget().updateAll(applicationContext)
            NextEventWidget().updateAll(applicationContext)

            Result.success()
        } catch (e: Exception) {
            e.printStackTrace()
            Result.retry()
        }
    }
}
