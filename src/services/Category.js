import Categories from "../models/Categories.js";
import NotFoundError from "../errors/not-found-error.js";

const createCategory = async (userData, adminRole) => {

  //added role check for admin
   if (adminRole !== "admin") {
    const error = new Error("Access denied");
    error.statusCode = 403;
    throw error;
  }

  const category = await Categories.create(userData);
  return category;
};

const getAllCategories = async (query) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    sort = "createdAt",
    order = "desc",
  } = query;

  let where = {};

  if (search) {
    where.$or = [
      { name: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  const total = await  Categories.countDocuments(where);
  const totalPages = Math.ceil(total / limit);

  const data = await Categories.find(where)
    .skip((page - 1) * limit)
    .limit(limit)
    .sort({ [sort]: order });

  return {
    data,
    total,
    limit: +limit,
    totalPages,
  };
};

const getCategoryById = async (catId) => {
  const data = await Categories.findById(catId);
  if (!data) {
    throw new NotFoundError("Category not found");
  }

  return { data };
};

const updateCategory = async (catId, catData, adminRole) => {


    //added role check for admin
   if (adminRole !== "admin") {
    const error = new Error("Access denied");
    error.statusCode = 403;
    throw error;
  }

  const data = await Categories.findByIdAndUpdate(
    catId,
    {
      ...(catData.name && { name: catData.name }),
      ...(catData.description && { description: catData.description }),
    
    },
    {
      new: true,
      runValidators: true,
    }
  );
  if (!data) {
    throw new NotFoundError("Category not found");
  }

  return { data };
};

const deleteCategory = async (catId, adminRole) => {

     //added role check for admin
   if (adminRole !== "admin") {
    const error = new Error("Access denied");
    error.statusCode = 403;
    throw error;
  }

  const category = await Categories.findByIdAndDelete(catId);
  if (!category) {
    throw new NotFoundError("Category not found");
  }
  return { message: "Category deleted successfully" };
};



export { createCategory, getAllCategories, getCategoryById, updateCategory, deleteCategory };
