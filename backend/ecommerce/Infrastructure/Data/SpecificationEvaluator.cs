using System.Linq;
using Core.Entities;
using Core.Specifications;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Data
{
    public class SpecificationEvaluator<TEntity> where TEntity : BaseEntity
    {
        public static IQueryable<TEntity> GetQuery(IQueryable<TEntity> inputQuery, ISpecification<TEntity> spec)
        {
            var query = inputQuery;

            if(spec.Criteria != null)
            {
                query = query.Where(spec.Criteria);
            }

            IOrderedQueryable<TEntity>? ordered = null;
            if (spec.OrderBy != null)
                ordered = query.OrderBy(spec.OrderBy);
            else if (spec.OrderByDescending != null)
                ordered = query.OrderByDescending(spec.OrderByDescending);

            if (ordered != null)
                query = ordered.ThenBy(x => x.Id);

            if (spec.isPagingEnabled)
            {
                query = query.Skip(spec.Skip).Take(spec.Take);
            }

            query = spec.Includes.Aggregate(query, (current, include) => current.Include(include));

            return query;
        }
    }
}