import DayProgress from './DayProgress'
import WeeklyScore from './WeeklyScore'
import MonthlyScore from './MonthlyScore'
import RewardsCard from './RewardsCard'
import { getMonthDates } from '../utils/dateUtils'

export default function ScoresPanel({
  todayEarned, todayMax, dayComplete, todayHabitEarned, todayTaskEarned,
  weekDates, weekEarned, weekMax, weekComplete,
  monthEarned, monthMax, monthComplete,
  logs, habits, tasks,
  includeWeekends, onToggleWeekends,
  rewards, xpByScope, onClaimReward, onEditReward, onDeleteReward, onAddReward,
  onNavigateDate, viewedDate, streakFreezes = {},
}) {
  const monthDates = getMonthDates(new Date(), includeWeekends)

  return (
    <div className="scores-panel">
      <DayProgress
        earned={todayEarned}
        max={todayMax}
        dayComplete={dayComplete}
        habitEarned={todayHabitEarned}
        taskEarned={todayTaskEarned}
        viewedDate={viewedDate}
      />

      <WeeklyScore
        weekDates={weekDates}
        weekEarned={weekEarned}
        weekMax={weekMax}
        weekComplete={weekComplete}
        logs={logs}
        habits={habits}
        tasks={tasks}
        includeWeekends={includeWeekends}
        onToggleWeekends={onToggleWeekends}
      />

      <MonthlyScore
        monthEarned={monthEarned}
        monthMax={monthMax}
        monthComplete={monthComplete}
        monthDates={monthDates}
        logs={logs}
        habits={habits}
        tasks={tasks}
        onNavigateDate={onNavigateDate}
        streakFreezes={streakFreezes}
      />

      <RewardsCard
        rewards={rewards}
        xpByScope={xpByScope}
        includeWeekends={includeWeekends}
        onClaim={onClaimReward}
        onEdit={onEditReward}
        onDelete={onDeleteReward}
        onAdd={onAddReward}
      />
    </div>
  )
}
