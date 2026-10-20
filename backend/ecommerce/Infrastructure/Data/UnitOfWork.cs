using Core.Entities;
using Core.Interfaces;

namespace Infrastructure.Data;

public class UnitOfWork(StoreContext context) : IUnitOfWork
{
    private readonly Dictionary<Type, object> _repositories = [];

    public Task<int> Complete() => context.SaveChangesAsync();

    public IGenericRepository<TEntity> Repository<TEntity>() where TEntity : BaseEntity
    {
        if (!_repositories.TryGetValue(typeof(TEntity), out var repository))
        {
            repository = new GenericRepository<TEntity>(context);
            _repositories[typeof(TEntity)] = repository;
        }

        return (IGenericRepository<TEntity>)repository;
    }
}