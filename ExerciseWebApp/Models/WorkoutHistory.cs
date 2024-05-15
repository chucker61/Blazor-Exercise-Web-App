namespace ExerciseWebApp.Models
{
    public class WorkoutHistory
    {
        public int Id { get; set; }
        public DateTime Duration { get; set; }
        public Workout Workout { get; set; }
        public List<ExerciseHistory> ExerciseHistories { get; set; }
    }
}
