namespace API.Helpers;

public sealed record Pagination<T>(int PageIndex, int PageSize, int Count, IReadOnlyList<T> Data)
    where T : class;