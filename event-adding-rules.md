# Event Adding Rules

## Workflow for Adding Events

When asked to add events (CTs, quizzes, assignments, etc.), follow these steps:

### 1. Determine the Event Date
- **ALWAYS check the current date FIRST**: Use `date +"%A, %B %d, %Y"` to get today's date and day of the week
- **Check existing events**: Run `node check-live-data.js | grep -A 30 "📅 EVENTS"` to see what's already scheduled
- **Check the class schedule**: Run `node check-live-data.js | grep -A 40 "📚 CLASSES"` to see the routine
- **Calculate next occurrence**:
  - If the user says "next [day]", find the next occurrence of that day from TODAY (not from an assumed date)
  - If the user says "this week", it means within the current week (Mon-Sun)
  - If the user says "next week", it means the following week
  - Generate a calendar for the next 2 weeks using TODAY's date: `for i in {0..14}; do date -d "$(date +%Y-%m-%d) + $i days" +"%Y-%m-%d %A"; done`

### 2. Verify Class Time
- Match the event time with the actual class time from the routine
- Double-check with the user if the day doesn't match the typical schedule (e.g., special extra classes)

### 3. Event Schema
Use the correct database schema when adding events:

```javascript
{
  date: 'YYYY-MM-DD',           // Event date
  time: 'HH:MM',                // Event time in 24-hour format
  name: 'Event Name',           // Short descriptive name
  info: 'Detailed description', // Full details about the event
  event_type: 'CT',             // Valid types: 'CT', 'Lab', 'Quiz', 'Assignment'
  priority: 'urgent',           // 'urgent', 'high', 'medium', 'low'
  is_completed: false           // Boolean for completion status
}
```

### 4. Valid Event Types
- **CT**: Class Tests
- **Lab**: Lab Reports/Assignments
- **Quiz**: Quizzes
- **Assignment**: General Assignments

### 5. Always Verify
After adding events:
```bash
node check-live-data.js | grep -A 30 "📅 EVENTS"
```

### 6. Common Mistakes to Avoid
- ❌ Don't assume "next Monday" means the immediate next Monday without checking today's date
- ❌ Don't use wrong event_type values (will violate check constraint)
- ❌ Don't use field names like `description` or `details` (use `info`)
- ❌ Don't add events without verifying the class schedule first
- ❌ **ALWAYS verify existing events before adding/updating**: Check if an event already exists with similar name to avoid duplicates or incorrect updates
- ❌ **When user says "next Saturday" or similar**: Calculate from TODAY's date, not from an assumed date
- ❌ **When updating events**: Always confirm the exact date with the user if there's any ambiguity
- ❌ **Event corrections**: If user reports wrong dates, immediately check current events in database and fix them
- ❌ **Date calculations**: When showing "tomorrow", verify what day "today" actually is first

### 7. Example Workflow

```bash
# Step 1: Check today's date
date +"%A, %B %d, %Y"

# Step 2: Check routine
node check-live-data.js | grep -A 40 "📚 CLASSES"

# Step 3: Generate calendar for next 2 weeks
for i in {0..14}; do date -d "2026-01-20 + $i days" +"%Y-%m-%d %A"; done

# Step 4: Add event using Node.js script with correct schema
# (See add-cts.js or fix-cts.js as templates)

# Step 5: Verify
node check-live-data.js | grep -A 30 "📅 EVENTS"
```

## Quick Reference
- **Service Role Key**: Found in `.env` as `SUPABASE_SERVICE_ROLE_KEY`
- **Template Scripts**: `add-cts.js`, `fix-cts.js`, `add-ml-lab-report.js`
- **Verification Script**: `check-live-data.js`
