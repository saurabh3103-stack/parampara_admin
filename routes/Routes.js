const express = require('express');
const jwt = require("jsonwebtoken");
const router = express.Router();
const { signin, authenticateToken } = require('../middlewares/authMiddleware');  // Import the functions

const { createUser, getUsers,loginUser, getUserByEmail,updateUser ,updateUserStatus,forgetpassword,verifyOtpUser,resetPassword,getUserById } = require('../controllers/userController');
const { createlocation, getlocation } = require('../controllers/locationController');
const { createAdmin, getAdmin } = require('../controllers/adminController');
const { createPoojaCategory, getPoojaCategory, getPoojaCategoryWeb ,deletePoojaCategory, getPoojaCategoryById, updatePoojaCategroy, updatePoojaCategoryStatus} = require('../controllers/poojaCategoryController');
const { createPooja, getPooja, getPoojaUser , getPoojaUserbyID, updatePoojaStatus, deletePooja, getPoojaById,updatePoojaById,getPoojaBookingPandit,getPoojaBookingUser,getPoojaByCategoryId,getmissedBooking,getAllPoojaBookingUser,getAllPoojaBookingPandit } = require('../controllers/poojaController');
const { createPoojaSamagri, getPoojaSamaagri,samagriByPoojaId } = require('../controllers/poojaSamagriController');
const { createSliderCategory,getSliderCategory, deleteSliderCategory, getSliderCategoryById, updateSliderCategory,updateSliderCategoryStatus} = require('../controllers/appSliderCategoryController');
const { createSlider,getSlider, getSliderUser, deleteSlider, getSliderById, updateSlider, updateSliderStatus } = require('../controllers/appSliderController');
const { createPandit,getPandits,loginPandit,updatePanditById, deletePanditById ,getPanditById,createPanditCategory,getPanditCategoryByPanditId,forgotPassword,verifyOtppandit,resetpassword } = require('../controllers/panditController');
const { getPanditsInRange }=require('../controllers/PanditRangeController')
const { sendOtp,verifyOtp } = require("../controllers/otpController");
const { addToCart,getCartItems,removeCartItem,removeAllCartItems} = require("../controllers/cartController");
const { createPoojaBooking,getOrder,getAllOrders,updatePoojaBooking,getPoojaOrdersByUserId,acceptRejectBooking,cancelPoojaBooking,poojaStart,poojaComplete} = require("../controllers/orderController");
const { addDeliveryAddress,getDeliveryAddress,getAllOrdersWithAddress,getDeliveryAddressByUSerID,updateDeliveryAddressByUserId} = require("../controllers/deliveryAddressController");
const { createBhanjanMandaliBooking,getBhajanOrder,acceptOrRejectMandaliBooking,updateMandaliOrder,startBhajanMandal,completeBhajanMandal,cancelBhajanMandalOrder} = require('../controllers/bhajanmandalBookingController');    
const { createTransaction } = require("../controllers/transactionController");
const { createBhajanCategory,getbhajanCategory,getbhajanCategoryUser,deletebhajanCategory,getbhajanCategoryById,updateBhajanCategory,updateBhajanCategoryStatus } = require("../controllers/bhajan_categoryController");
const { createBhajan,getBhajanBySlug,getBhajanById,getAllBhajans,getActiveBhajans,updateBhajan,updateBhajanStatus,deleteBhajan,getBhajansByCategory,bhajanLogin,bhajanMandaliBookingUser,getBhajanMandaliBooking,getAllBhajanMandaliBooking,bhajanMandaliBookingUserID,ca,bhajanMandaliCity,bhajanMandaliByCity} = require("../controllers/bhajanmandalController");
const { addVideo,editVideo,deleteVideo,getVideosByBhajanMandal,getactiveVideosByBhajanMandal,getAllBhajanMandalVideos } = require('../controllers/bhajanvideoController');
const { createBrahmanBhoj,getBrahmanBhoj,getBrahmanBhojByID,cancelBrahmanByID,getBrahmanBhojByuserID } = require('../controllers/brahmanBhojController');
const { createCategory,getAllCategories,getActiveCategories,getCategoryById,updateCategory,deleteCategory,activeInactive}= require('../controllers/EcommerceController/ProductCategoryController');
const { ecomaddToCart, ecomgetCart, ecomremoveCartItem, ecomclearCart } = require("../controllers/EcommerceController/EcommerceCartController");

const { addProduct,updateProduct,getAllProduct,getProductById,deleteProduct,updateStatus,updateQuantity,updateFeaturedStatus,getProductsByCategory,getProducrBySlug,featuredProduct,offeredproduct } = require('../controllers/EcommerceController/ProductController');
// const { createReview,updateReview,deleteReview,hideReviewgetAllReviews }= require('../controllers/EcommerceController/ProductReviewController');
const {createOrder,updateOrderPayment,geteStoreOrder,geteStoreAllOrder,updateOrderStatus,updateMultipleOrderStatuses,getAllOrderUserId}= require("../controllers/EcommerceController/EcommerceOrderController");
const {addStory,addSubStory,getSubStoryById,updateStory,updateSubStory,updateStoryStatus,deleteStory,addStoryCategory,updateStoryCategory,deleteStoryCategory,getStoryCategoryById,getStoryData,getSubStoryData,getStoryCategory,getAllStoryCategories,getActiveStoryCategory,updateStoryCategoryStatus,updateSubStoryStatus,getAllStories,getAllActiveStories} = require("../controllers/storyController");
const {createPanditRange,getPanditRange,updatePanditRange,createCommision,getCommission,updateCommission} = require("../controllers/SettingController");
const { loginPartner,registerPartner } = require("../controllers/partnerController");
const { createBhavyaAyojan,getBhavyaAyojan,getBhavyaAyojanByID,cancelBhavyaAyojanByID,getBhavyaAyojanByUserID } = require("../controllers/bhavyaAyojanController");
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
// Partner Login

router.post('/partner/login',authenticateToken,loginPartner);
router.post('/partner/register',authenticateToken,registerPartner);
// Partner Login

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
router.put('/pooja/cancel-booking/',authenticateToken,cancelPoojaBooking);

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
router.get("/user/get-booking-user/:userId/:bookingstatus",authenticateToken,getPoojaBookingUser);
router.get("/user/get-booking-user/:userId",authenticateToken,getAllPoojaBookingUser);
router.get("/user/delivery-address/:userId",authenticateToken,getDeliveryAddressByUSerID);
router.put("/user/update-delivery-address/:userId",authenticateToken,updateDeliveryAddressByUserId);
router.get("/user/get-mandali-booking/:userId/:bookingstatus",authenticateToken,bhajanMandaliBookingUser);

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
router.get('/pandit/pooja-booking/:panditId/:bookingstatus',authenticateToken,getPoojaBookingPandit);
router.get('/pandit/pooja-booking/:panditId',authenticateToken,getAllPoojaBookingPandit);
router.get('/pandit/missed-booking/:panditId',authenticateToken,getmissedBooking);
router.put('/pandit/update-category',authenticateToken,createPanditCategory);
router.get('/pandit/get-category/:pandit_id',authenticateToken,getPanditCategoryByPanditId);
router.post('/pandit/forget-password',authenticateToken,forgotPassword);
router.post('/pandit/verify-otp',authenticateToken,verifyOtppandit);
router.put('/pandit/reset-password',authenticateToken,resetpassword);
router.post('/pandit/start-pooja',authenticateToken,poojaStart);
router.post('/pandit/complete-pooja',authenticateToken,poojaComplete);
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
router.get('/bhajanMandal/get-all-videos',authenticateToken,getAllBhajanMandalVideos);
router.get('/bhajanMandal/get-all-booking/:mandaliId/:bookingstatus',authenticateToken,getBhajanMandaliBooking);
router.get('/bhajanMandal/get-all/:mandaliId',authenticateToken,getAllBhajanMandaliBooking);
router.post('/order/bhajan-mandali',authenticateToken,createBhanjanMandaliBooking);
router.get('/order/bhajan-mandli/:orderId',authenticateToken,getBhajanOrder);
router.put('/order/update-mandali-order',authenticateToken,updateMandaliOrder);
router.put('/order/accept-reject-mandali',authenticateToken,acceptOrRejectMandaliBooking);
router.post('/bhajan-mandali/start-bhajan',authenticateToken,startBhajanMandal);
router.post('/bhajan-mandali/complete-bhajan',authenticateToken,completeBhajanMandal);
router.put('/bhajan/cancel-booking/',authenticateToken,cancelBhajanMandalOrder);
router.get('/bhajan-mandali/booking-user/:userId',authenticateToken,bhajanMandaliBookingUserID);
router.get('/bhajan-mandal/city',authenticateToken,bhajanMandaliCity);
router.get('/bhajan-mandal/city/:cityName',authenticateToken,bhajanMandaliByCity);
// Bhajan Mandal Routes end
// Ecommerce Section 
router.post("/product/category",authenticateToken,createCategory);
router.get("/product/categories",authenticateToken,getAllCategories);
router.get("/product/categories/active",authenticateToken,getActiveCategories);
router.get("/product/category/:id",authenticateToken,getCategoryById);
router.put("/product/update-category/:id",authenticateToken,updateCategory);
router.delete("/product/delete-category/:id",authenticateToken,deleteCategory);
router.patch("/product/category/update-status/:id",authenticateToken,activeInactive); 
router.get("/product/featured-product",authenticateToken,featuredProduct);
router.get("/product/offered-product/:offerType",authenticateToken,offeredproduct);
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
router.delete("/product/clear-cart/:user_id", ecomclearCart);
router.post("/e-store/create-order",authenticateToken,createOrder);
router.put("/e-store/update-order/:combinedPaymentId",authenticateToken,updateOrderPayment);
router.get("/e-store/orders/:orderId",authenticateToken,geteStoreOrder);
router.get("/e-store/all-order",authenticateToken,geteStoreAllOrder);
router.get("/e-stroe/user-order/:userId",authenticateToken,getAllOrderUserId);
router.put("/e-store/update-order-status/:orderId",authenticateToken,updateOrderStatus);
router.put("/e-store/update-multiple-order-status",authenticateToken,updateMultipleOrderStatuses);
router.get("/user/:id",authenticateToken,getUserById);

// Ecommerce Section 

// // Ecommerce Review
// router.post("/product/reviews", authenticateToken.createReview);
// router.put("/product/reviews/:reviewId", authenticateToken.updateReview);
// router.delete("/product/reviews/:reviewId", authenticateToken.deleteReview);
// router.patch("/product/reviews/:reviewId/hide", authenticateToken.hideReview);
// router.get("/product/reviews", authenticateToken.getAllReviews);

// Ecommerce Review 

//App Settings

router.post("/setting/create-range",authenticateToken,createPanditRange);
router.get("/setting/pandit-range",authenticateToken,getPanditRange);
router.put("/setting/update-range",authenticateToken,updatePanditRange);
router.post("/setting/create-commission",authenticateToken,createCommision);
router.get("/setting/commission",authenticateToken,getCommission);
router.put("/setting/update-commision",authenticateToken,updateCommission);

// Story Section 
router.post("/story/add-story",authenticateToken,addStory);
router.post("/story/add-substory",authenticateToken,addSubStory);
// router.get("/story/get-story/:id",authenticateToken,getStoryBySlug);
router.get('/story/:storyId/substory',authenticateToken, getSubStoryById);

router.put("/story/update-story/:id",authenticateToken,updateStory);
router.put("/story/:storyId/update-substory/:subStoryId",authenticateToken,updateSubStory);
router.put("/story/update-status/:id",authenticateToken,updateStoryStatus);
router.delete("/story/delete-story/:id",authenticateToken,deleteStory);
router.post("/story/create-category",authenticateToken,addStoryCategory);
router.put("/story/update-category/:id",authenticateToken,updateStoryCategory);
router.delete("/story/delete-category/:id",authenticateToken,deleteStoryCategory);
router.get("/story/get-category/:id",authenticateToken,getStoryCategoryById);
router.get("/story/get-category",authenticateToken,getAllStoryCategories);
router.get("/story/get-active-category",authenticateToken,getActiveStoryCategory);
router.patch("/story/category-status/:id/status",authenticateToken,updateStoryCategoryStatus);
router.patch("/story/update-status/:id/status",authenticateToken,updateStoryStatus);
router.patch("/story/update-sub-story-status/:id/status",authenticateToken,updateSubStoryStatus);
router.get("/story/get-all-story",authenticateToken,getAllStories);
router.get("/story/get-active-story",authenticateToken,getAllActiveStories);
router.get('/story-category/:idOrSlug',authenticateToken,getStoryCategory);
router.get('/story/:idOrSlug', authenticateToken,getStoryData);
router.get('/story/:storyIdOrSlug/substory/:subStoryIdOrSlug', authenticateToken,getSubStoryData);

// Story Section
// Brahman Bhoj

router.post('/brahman-bhoj/create-request',authenticateToken,createBrahmanBhoj);
router.get('/brahman-bhoj/get-bhoj-request',authenticateToken,getBrahmanBhoj);
router.get('/brahman-bhoj/get-details/:id',authenticateToken,getBrahmanBhojByID);
router.put('/brahman-bhoj/cancel-request/:id',authenticateToken,cancelBrahmanByID);
router.get('/brahman-bhoj/user/:userId',authenticateToken,getBrahmanBhojByuserID);
// Brahman Bhoj
// Bhavya ayojan

router.post('/bhavya-ayojan/create',authenticateToken ,createBhavyaAyojan);
router.get('/bhavya-ayojan/all', authenticateToken,getBhavyaAyojan);
router.get('/bhavya-ayojan/:id',authenticateToken ,getBhavyaAyojanByID);
router.put('/bhavya-ayojan/cancel/:id', authenticateToken,cancelBhavyaAyojanByID);
router.get('/bhavya-ayojan/user-id/:userId',authenticateToken,getBhavyaAyojanByUserID);

// Bhavya ayojan
module.exports = router;
