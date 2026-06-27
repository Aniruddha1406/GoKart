import express from "express";
import { customer_authenticate } from "../middleware/customer.auth.middleware.js";
import { seller_authenticate } from "../middleware/seller.auth.middleware.js";
import productController from "../controller/products.controller.js";
import { addReview, getReviews, deleteReview } from "../controller/review.controller.js";
import multer from "multer";

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

router.get(
  "/products",
  customer_authenticate,
  productController.getAllProducts,
);
router.get(
  "/products/tech",
  customer_authenticate,
  productController.getProductsTech,
);
router.get(
  "/products/food",
  customer_authenticate,
  productController.getProductsFood,
);
router.get(
  "/products/clothing",
  customer_authenticate,
  productController.getProductsClothing,
);
router.get(
  "/products/:id",
  customer_authenticate,
  productController.getProductsById,
);
// Reviews
router.get("/products/:id/reviews",    customer_authenticate, getReviews);
router.post("/products/:id/reviews",   customer_authenticate, addReview);
router.delete("/products/:id/reviews", customer_authenticate, deleteReview);
router.get(
  "/seller/my-products",
  seller_authenticate,
  productController.getMyProducts,
);
router.get(
  "/seller/products/:id",
  seller_authenticate,
  productController.getProductsById,
);
router.post(
  "/seller/products",
  seller_authenticate,
  upload.single("images"),
  productController.createProduct,
);
router.patch(
  "/seller/products/:id",
  seller_authenticate,
  upload.single("images"),
  productController.updateProduct,
);
router.delete(
  "/seller/products/:id",
  seller_authenticate,
  productController.deleteProduct,
);

export default router;
