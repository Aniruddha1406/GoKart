import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken";
import uploadImage from "../services/imagekit.service.js";
import productModel from "../models/product.model.js";

export const getAllProducts = async (req, res) => {
  try {
    const products = await productModel.find({ isDeleted: false });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Error getting products" });
  }
}

export const getProductsTech = async (req, res) => {
  try {
    const products = await productModel.find({ category: "Tech", isDeleted: false });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Error getting products" });
  }
}

export const getProductsFood = async (req, res) => {
  try {
    const products = await productModel.find({ category: "Food", isDeleted: false });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Error getting products" });
  }
}

export const getProductsClothing = async (req, res) => {
  try {
    const products = await productModel.find({ category: "Clothing", isDeleted: false });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Error getting products" });
  }
}

export const getProductsById = async (req, res) => {
  try {
    const products = await productModel.findOne({ _id: req.params.id, isDeleted: false });
    if (!products) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Error getting products" });
  }
}

export const getMyProducts = async (req, res) => {
  try {
    const user = req.user;
    const products = await productModel.find({ seller: user._id, isDeleted: false });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Error getting products" });
  }
}

export const createProduct = async (req, res) => {
  try {
      console.log('createProduct req.user =', req.user);
      console.log('createProduct req.file =', req.file);
      const user = req.user;
    const { name, price, description, category } = req.body;
    let image = req.file ? await uploadImage(req.file.buffer) : undefined;
    if(image === undefined) image = req.body.images || undefined;
    const product = new productModel({
      name,
      price,
      description,
      category,
      images: image,
      seller: user._id,
    });
    await product.save();
    res.status(201).json({ message: "Product created successfully" });
  } catch (error) {
    res.status(500).json({ message: `Error creating product: ${error.message}` });
  }
}

export const updateProduct = async (req, res) => {
  try {
    const user = req.user;
    const id = req.params.id;
    const { name, price, description, category } = req.body;

    const updateData = {
      name,
      price,
      description,
      category,
      seller: user._id,
    };

    if (req.file) {
      updateData.images = await uploadImage(req.file.buffer);
    } else if (req.body.images) {
      updateData.images = req.body.images;
    }

    const product = await productModel.findByIdAndUpdate(id, updateData, {
      returnDocument: 'after',
      runValidators: true,
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: `Error updating product: ${error.message}` });
  }
}

export const deleteProduct = async (req, res) => {
  try {
    const user = req.user;
    const id = req.params.id;
    const product = await productModel.findByIdAndUpdate(id, { isDeleted: true });
    if(!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error in deleteProduct:", error);
    res.status(500).json({ message: "Error deleting product", error: error.message });
  }
}
const productController = {
  getAllProducts,
  getProductsTech,
  getProductsFood,
  getProductsClothing,
  getProductsById,
  getMyProducts,
  createProduct,
  updateProduct,
  deleteProduct,
};
export default productController;
