const express = require('express');
const jwt = require("jsonwebtoken");
const router = express.Router();
const { signin, authenticateToken } = require('../middlewares/authMiddleware');  // Import the functions

const { createUser, getUsers,loginUser, getUserByEmail,updateUser ,updateUserStatus,forgetpassword,verifyOtpUser,resetPassword } = require('../controllers/userController');
const { createlocation, getlocation } = require('../controllers/locationController');
const { createAdmin, getAdmin } = require('../controllers/adminController');
const { createPoojaCategory, getPoojaCategory, getPoojaCategoryWeb ,deletePoojaCategory, getPoojaCategoryById, updatePoojaCategroy, updatePoojaCategoryStatus} = require('../controllers/poojaCategoryController');
const { createPooja, getPooja, getPoojaUser , getPoojaUserbyID, updatePoojaStatus, deletePooja, getPoojaById,updatePoojaById,getPoojaBookingPandit,getPoojaBookingUser,getPoojaByCategoryId } = require('../controllers/poojaController');
const { createPoojaSamagri, getPoojaSamaagri,samagriByPoojaId } = require('../controllers/poojaSamagriController');
const { createSliderCategory,getSliderCategory, deleteSliderCategory, getSliderCategoryById, updateSliderCategory,updateSliderCategoryStatus} = require('../controllers/appSliderCategoryController');
const { createSlider,getSlider, getSliderUser, deleteSlider, getSliderById, updateSlider, updateSliderStatus } = require('../controllers/appSliderController');
const { createPandit,getPandits,loginPandit,updatePanditById, deletePanditById ,getPanditById,createPanditCategory,getPanditCategoryByPanditId,forgotPassword,verifyOtppandit,resetpassword } = require('../controllers/panditController');
const { getPanditsInRange }=require('../controllers/PanditRangeController')
const { sendOtp,verifyOtp } = require("../controllers/otpController");
const { addToCart,getCartItems,removeCartItem,removeAllCartItems} = require("../controllers/cartController");
const { createPoojaBooking,createBhanjanMandaliBooking,getBhajanOrder,getOrder,addDeliveryAddress,getDeliveryAddress,
    getAllOrders,getAllOrdersWithAddress,updatePoojaBooking,getPoojaOrdersByUserId,acceptRejectBooking,
    updateMandaliOrder,getDeliveryAddressByUSerID,acceptOrRejectMandaliBooking} = require("../controllers/orderController");
const { createTransaction } = require("../controllers/transactionController");
const { createBhajanCategory,getbhajanCategory,getbhajanCategoryUser,deletebhajanCategory,getbhajanCategoryById,updateBhajanCategory,updateBhajanCategoryStatus } = require("../controllers/bhajan_categoryController");
const { createBhajan,getBhajanBySlug,getBhajanById,getAllBhajans,getActiveBhajans,updateBhajan,updateBhajanStatus,deleteBhajan,getBhajansByCategory,bhajanLogin} = require("../controllers/bhajanmandalController");
const { addVideo,editVideo,deleteVideo,getVideosByBhajanMandal,getactiveVideosByBhajanMandal } = require('../controllers/bhajanvideoController');
const { createCategory,getAllCategories,getActiveCategories,getCategoryById,updateCategory,deleteCategory,activeInactive}= require('../controllers/EcommerceController/ProductCategoryController');
const { ecomaddToCart, ecomgetCart, ecomremoveCartItem, ecomclearCart } = require("../controllers/EcommerceController/EcommerceCartController");

const { addProduct,updateProduct,getAllProduct,getProductById,deleteProduct,updateStatus,updateQuantity,updateFeaturedStatus,getProductsByCategory,getProducrBySlug } = require('../controllers/EcommerceController/ProductController');
// const { createReview,updateReview,deleteReview,hideReviewgetAllReviews }= require('../controllers/EcommerceController/ProductReviewController');
const {createOrder,updateOrder}= require("../controllers/EcommerceController/EcommerceOrderController");
const {addStory,uploadSubStoryImages,getStories,deleteStory,getStoryById,updateStory} = require("../controllers/storyController");

// Define other routes (existing ones)

router.post('/signin', signin);
router.post('/admin/', authenticateToken, createAdmin);
router.get('/admin/', authenticateToken, getAdmin);
router.post('/find-pandit', authenticateToken, getPanditsInRange);
router.post('/user/create-user', authenticateToken, createUser);
router.post('/user/login',authenticateToken, loginUser);
router.get('/user/all-user', authenticateToken, getUsers);

router.post('/user/get-user/',authenticateToken, getUserByEmail);
router.put('/user/update-user/:userId', authenticateToken, updateUser);

router.put('/user/update-status',authenticateToken,updateUserStatus);
router.post('/user/forget-password',authenticateToken,forgetpassword);
router.post('/user/verify-otp',authenticateToken,verifyOtpUser);
router.put('/user/reset-password',authenticateToken,resetPassword);
router.post('/location/', authenticateToken, createlocation);
router.get('/location/', authenticateToken, getlocation);

// Start Pooja Routes
router.get('/pooja/all-pooja/', authenticateToken, getPooja);
router.post('/pooja/create-pooja/', authenticateToken, createPooja);
router.get('/pooja/all-poojaUser',authenticateToken,getPoojaUser);
router.get('/pooja/category-id/:categoryId',authenticateToken,getPoojaByCategoryId);
router.get('/pooja/all-poojaUser/:id',authenticateToken,getPoojaUserbyID);
router.get('/pooja/pooja/:id',authenticateToken , getPoojaById);
router.put('/pooja/update-pooja/:id',authenticateToken,updatePoojaById);
router.put('/pooja/update-status/', authenticateToken, updatePoojaStatus);
router.delete('/pooja/delete-pooja/:poojaId', authenticateToken, deletePooja);
router.get('/pooja/category/', authenticateToken, getPoojaCategory);
router.get('/pooja/category/web', authenticateToken, getPoojaCategoryWeb);
router.post('/pooja/create-category/', authenticateToken, createPoojaCategory);
router.delete('/pooja/category/delete/:id', authenticateToken , deletePoojaCategory);
router.get('/pooja/category/:id', authenticateToken , getPoojaCategoryById);
router.put('/pooja/category/update-category/:id', authenticateToken , updatePoojaCategroy);
router.put('/pooja/category/update-status', authenticateToken , updatePoojaCategoryStatus);
router.get('/pooja/all-samagri/', authenticateToken, getPoojaSamaagri);
router.post('/pooja/add-samagri/', authenticateToken, createPoojaSamagri);
router.get('/pooja/samagri/:id',authenticateToken,samagriByPoojaId);
router.post("/order/pooja-booking",authenticateToken, createPoojaBooking); 
router.get("/orders/:orderId",authenticateToken, getOrder); 
router.put("/orders/update-order",authenticateToken,updatePoojaBooking);
router.post("/order/delivery-address",authenticateToken, addDeliveryAddress); 
router.get("/order/delivery-address/:orderId",authenticateToken, getDeliveryAddress); 
router.get("/orders",authenticateToken,getAllOrders);
router.get('/order-address',authenticateToken,getAllOrdersWithAddress);
router.get("/orders/user/:userId",authenticateToken, getPoojaOrdersByUserId);
router.post("/orders/acceptReject",authenticateToken,acceptRejectBooking);
router.get("/user/get-booking-user/:userId",authenticateToken,getPoojaBookingUser);
router.get("/user/delivery-address/:userId",authenticateToken,getDeliveryAddressByUSerID);

// End Pooja Routes

router.post('/slider/create-category/',authenticateToken,createSliderCategory);
router.put('/slider/category/update-status',authenticateToken,updateSliderCategoryStatus);
router.get('/slider/all-category/',authenticateToken,getSliderCategory);
router.get('/slider/category/:id',authenticateToken , getSliderCategoryById);
router.put('/slider/category/update-category/:id',authenticateToken, updateSliderCategory)
router.post('/slider/create-slider/',authenticateToken,createSlider);
router.get('/slider/all-slider/',authenticateToken,getSlider);
router.delete('/slider/delete/:id', authenticateToken , deleteSlider);
router.get('/slider/:id',authenticateToken,getSliderById);
router.put('/slider/update-slider/:id',authenticateToken,updateSlider);
router.put('/slider/update-status',authenticateToken,updateSliderStatus);
router.delete('/slider/category/delete/:id', authenticateToken , deleteSliderCategory);
router.post('/slider/get-slider',authenticateToken,getSliderUser);
router.post('/pandit/create-pandit',authenticateToken,createPandit);
router.put('/pandit/update-pandit/:id',authenticateToken,updatePanditById);
router.delete('/pandit/delete-pandit/:id',authenticateToken,deletePanditById);
router.get('/pandit/all-pandit',authenticateToken,getPandits);
router.post('/pandit/login-pandit',authenticateToken,loginPandit);
router.get('/pandit/get-pandit/:id',authenticateToken,getPanditById);
router.get('/pandit/pooja-booking/:panditId',authenticateToken,getPoojaBookingPandit);
router.put('/pandit/update-category',authenticateToken,createPanditCategory);
router.get('/pandit/get-category/:pandit_id',authenticateToken,getPanditCategoryByPanditId);
router.post('/pandit/forget-password',authenticateToken,forgotPassword);
router.post('/pandit/verify-otp',authenticateToken,verifyOtppandit);
router.put('/pandit/reset-password',authenticateToken,resetpassword);

router.post("/otp/send-otp", authenticateToken ,sendOtp);
router.post("/otp/verify-otp", authenticateToken,verifyOtp);
router.post("/cart/addCart",authenticateToken,addToCart);
router.get("/cart/get-cart/:id",authenticateToken,getCartItems);
router.delete("/cart/remove/:product_id/:user_id",authenticateToken,removeCartItem);
router.delete("/cart/clear/:user_id", authenticateToken,removeAllCartItems);
router.post("/transcation/create-transcation",authenticateToken,createTransaction);


// Bhajan Mandal Routes Start

router.post("/bhajanMandal/login",authenticateToken,bhajanLogin);
router.post("/bhajanMandal/create-category",authenticateToken,createBhajanCategory);
router.get("/bhajanMandal/category",authenticateToken,getbhajanCategory);
router.get("/bhajanMandal/ctegory-user",authenticateToken,getbhajanCategoryUser);
router.delete("/bhajanMandal/delete-category/:id",authenticateToken,deletebhajanCategory);
router.get("/bhajanMandal/category-id/:id",authenticateToken,getbhajanCategoryById);
router.put("/bhajanMandal/update-category/:id",authenticateToken,updateBhajanCategory);
router.put("/bhajanMandal/update-category-status",authenticateToken,updateBhajanCategoryStatus);
router.post("/bhajanMandal/create", authenticateToken,createBhajan);
router.get("/bhajanMandal/bhajan/:slug", authenticateToken,getBhajanBySlug);
router.get("/bhajanMandal/single_bhajan/:id", authenticateToken,getBhajanById);
router.get("/bhajanMandal/all", authenticateToken,getAllBhajans);
router.get("/bhajanMandal/active", authenticateToken,getActiveBhajans);
router.put("/bhajanMandal/update-bhajan/:id", authenticateToken,updateBhajan);
router.put("/bhajanMandal/bhajan-status/:id", authenticateToken,updateBhajanStatus);
router.delete("/bhajanMandal/delete-bhajan/:id", authenticateToken,deleteBhajan);
router.get("/bhajanMandal/all-bhajanCategoryId/:categoryId",authenticateToken,getBhajansByCategory);
router.post('/bhajanMandal/add-video', authenticateToken, addVideo);
router.put('/bhajanMandal/edit-video', authenticateToken, editVideo);
router.delete('/bhajanMandal/delete/:video_id', authenticateToken, deleteVideo);
router.get('/bhajanMandal/get-videos/:bhajan_mandal_id', authenticateToken, getVideosByBhajanMandal);
router.get('/bhajanMandal/get-active-video/:bhajan_mandal_id',authenticateToken,getactiveVideosByBhajanMandal);
router.post('/order/bhajan-mandali',authenticateToken,createBhanjanMandaliBooking);
router.get('/order/bhajan-mandli/:orderId',authenticateToken,getBhajanOrder);
router.put('/order/update-mandali-order',authenticateToken,updateMandaliOrder);
router.put('/order/accept-reject-mandali',authenticateToken,acceptOrRejectMandaliBooking);
// Bhajan Mandal Routes end
// Ecommerce Section 
router.post("/product/category",authenticateToken,createCategory);
router.get("/product/categories",authenticateToken,getAllCategories);
router.get("/product/categories/active",authenticateToken,getActiveCategories);
router.get("/product/category/:id",authenticateToken,getCategoryById);
router.put("/product/update-category/:id",authenticateToken,updateCategory);
router.delete("/product/delete-category/:id",authenticateToken,deleteCategory);
router.patch("/product/category/update-status/:id",authenticateToken,activeInactive); 

router.post("/product/add-product",authenticateToken,addProduct);
router.put("/product/update-product/:id",authenticateToken,addProduct);
router.get("/product/get-all",authenticateToken,getAllProduct);
router.get("/product/get-product/:id",authenticateToken,getProductById);
router.delete("/product/delete/:id",authenticateToken,deleteProduct);
router.patch("/product/update-status/:id",authenticateToken,updateStatus);
router.put("/product/update-quantity/:id",authenticateToken,updateQuantity);
router.put("/product/:id/featured",authenticateToken,updateFeaturedStatus);
router.get("/product/category-id/:categoryId",authenticateToken,getProductsByCategory);
router.get("/product/product-details/:id",authenticateToken,getProducrBySlug);
router.post("/product/add-cart", authenticateToken,ecomaddToCart);
router.get("/product/cart/:user_id",authenticateToken,ecomgetCart);
router.delete("/product/cart/:user_id/:product_id", ecomremoveCartItem);
router.delete("/product/cart/clear/:user_id", ecomclearCart);
router.post("/e-store/create-order",authenticateToken,createOrder);
router.put("/e-store/update-order/:orderId",authenticateToken,updateOrder);
// Ecommerce Section 

// // Ecommerce Review
// router.post("/product/reviews", authenticateToken.createReview);
// router.put("/product/reviews/:reviewId", authenticateToken.updateReview);
// router.delete("/product/reviews/:reviewId", authenticateToken.deleteReview);
// router.patch("/product/reviews/:reviewId/hide", authenticateToken.hideReview);
// router.get("/product/reviews", authenticateToken.getAllReviews);

// Ecommerce Review 


// Story Section 
router.post("/story/add",authenticateToken,addStory);
router.get("/story/",authenticateToken,getStories);
router.delete("/story/:id",authenticateToken,deleteStory);
router.post("/story/:storyId/:subStoryIndex/images",authenticateToken,uploadSubStoryImages);
router.get("/story/:id",authenticateToken,getStoryById);
router.put("/story/update-story/:id",authenticateToken,updateStory);
// Story Section

module.exports = router;

