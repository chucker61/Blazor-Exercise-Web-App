namespace ExerciseWebApp.Services
{
    public class PageHistoryService
    {
        private Stack<string> previousPages;
        private Stack<string> nextPages;
        private readonly string errorPageUrl;
        public PageHistoryService()
        {
            previousPages = new Stack<string>();
            nextPages = new Stack<string>();
            errorPageUrl = "/errorPage";
        }

        public void AddPageToHistory(string pageName)
        {
            previousPages.Push(pageName);
        }

        public string GetGoBackPage()
        {
            // This condition is to check if it is the first loaded page "/"
            if (previousPages.TryPeek(out string url) && !string.IsNullOrWhiteSpace(url))
            {
                // If moved to the next page check
                if (previousPages.Count > 1)
                {
                    // Pop the current page
                    nextPages.Push(previousPages.Pop());
                    // Pop the previous page -> "/"
                    url = previousPages.Pop();
                    return url;
                }
            }

            // If stack is empty redirect to the error page
            return errorPageUrl;
        }

        public string GetGoForwardPage()
        {
            if (nextPages.TryPop(out string url) && !string.IsNullOrWhiteSpace(url))
                return url;

            // If stack is empty redirect to the error page
            return errorPageUrl;
        }

        public bool CanGoForward() => nextPages.Any();
        public bool CanGoBack() => previousPages.Count > 1;
    }
}
