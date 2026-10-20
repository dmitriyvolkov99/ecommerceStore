using Core.Entities;
using Core.Interfaces;
using Core.Specifications;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Data;

public class GenericRepository<T>(StoreContext context) : IGenericRepository<T> where T : BaseEntity
{
    public async Task<T> GetByIdAsync(int id) => await context.Set<T>().FindAsync(id);

    public async Task<IReadOnlyList<T>> ListAllAsync() => await context.Set<T>().ToListAsync();

    public async Task<T> GetEntityWithSpec(ISpecification<T> spec) =>
        await ApplySpecification(spec).FirstOrDefaultAsync();

    public async Task<List<T>> ListAsync(ISpecification<T> spec) =>
        await ApplySpecification(spec).ToListAsync();

    public async Task<int> CountAsync(ISpecification<T> spec) =>
        await ApplySpecification(spec).CountAsync();

    public void Add(T entity) => context.Set<T>().Add(entity);

    public void Update(T entity)
    {
        context.Set<T>().Attach(entity);
        context.Entry(entity).State = EntityState.Modified;
    }

    public void Delete(T entity) => context.Set<T>().Remove(entity);

    private IQueryable<T> ApplySpecification(ISpecification<T> spec) =>
        SpecificationEvaluator<T>.GetQuery(context.Set<T>().AsQueryable(), spec);
}