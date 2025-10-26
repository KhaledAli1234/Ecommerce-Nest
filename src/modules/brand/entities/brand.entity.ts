import { IBrand } from 'src/commen';

export class BrandResponse {
  brand: IBrand;
}

export class GetAllResponse {
  result: {
    docCount?: number;
    limit?: number;
    pages?: number;
    currentPage?: number | undefined;
    result?: IBrand[];
  };
}
