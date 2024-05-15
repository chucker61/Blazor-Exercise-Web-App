namespace ExerciseWebApp.Models
{
    public class ExerciseHistory
    {
        public int Id { get; set; }
        public Exercise Exercise { get; set; }
        public int Duration { get; set; }
        public int Repetitions { get; set; }
        public int Sets { get; set; }

    }
}
