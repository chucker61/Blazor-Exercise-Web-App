namespace ExerciseWebApp.Models
{
    public class Exercise
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public bool IsChecked { get; set; } = false;
    }
}
