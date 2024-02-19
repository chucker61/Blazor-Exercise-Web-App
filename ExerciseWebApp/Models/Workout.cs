namespace ExerciseWebApp.Models
{
    public class Workout
    {
        public string Name { get; set; }
        public string Difficulty { get; set; }
        public List<Exercise> Exercises { get; set; }
    }
}
