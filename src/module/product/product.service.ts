import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { TProduct } from './product.interface';
import { ProductModel } from './product.model';

const createProductIntoDb = async (payload: TProduct) => {
  // generate slug
  let slug = payload.slug;
  if (slug) {
    const isSlugExist = await ProductModel.find({ slug });
    if (isSlugExist) {
      throw new AppError(httpStatus.UNPROCESSABLE_ENTITY, 'Slug already exist');
    }
  } else {
    // create new slug
    const mainSlug = payload.name
      ?.replace(/[^\w\s-]/g, '')
      ?.replace(/\s+/g, '-');

    const slugList = await ProductModel.find({
      slug: {
        $regex: `^${mainSlug}(-\\d+)?$`,
        $options: 'i',
      },
    }).select('slug');
    const countList:number[] = slugList.map(el=>el.slug).map(slg=>{
        const words = slg.split("-")
        const lastWord = words[words.length-1]
        const lastWordAsNumber = parseInt(lastWord, 10);
        return isNaN(lastWordAsNumber) ? null: lastWordAsNumber
    }).filter((num):num is number=>num !== null).sort((a:number,b:number)=>(b-a))
    
    slug = countList.length ? `${mainSlug}-${countList[0]+1}` : mainSlug.length? `${mainSlug}-${1}`: mainSlug;
  }
  
  const result = await ProductModel.create({ ...payload, slug });
  return result;
};


const getAllProductsFromDb = async(query:Record<string,unknown>) =>{
  console.log(query);
  const tempQuery = { ...query };
  const excludeFields = [
    'page',
    'limit',
    'fields',
    'sortBy',
    'sortOrder',
    'maxPrice',
    'minPrice',
  ];
  const sortFieldList = [
    'name',
    'price',
    'quantity',
    'releaseDate',
    'brand',
    'model',
    'category',
    'operatingSystem',
    'connectivity',
  ];
  excludeFields.forEach((key) => {
    delete tempQuery[key];
  });

  // set default limit
  if (!query.limit) {
    query.limit = 10;
  }
  

  // build query aggregate pipeline builder 
  
  const result = await ProductModel.find()
  return result
}
export const productServices = {
  createProductIntoDb,
  getAllProductsFromDb
};
