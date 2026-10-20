using System.Collections.Generic;
using Core.Entities;

namespace Core.Specifications;

public class ProductsByIdsSpecification(IReadOnlyList<int> ids)
    : BaseSpecification<Product>(p => ids.Contains(p.Id));