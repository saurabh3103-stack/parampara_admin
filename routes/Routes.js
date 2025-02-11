const express = require('express');
const jwt = require("jsonwebtoken");
const router = express.Router();
const { signin, authenticateToken } = require('../middlewares/authMiddleware');  // Import the functions

const { createUser, getUsers,loginUser, getUserByEmail,updateUser ,updateUserStatus } = require('../controllers/userController');
const { createlocation, getlocation } = require('../controllers/locationController');
const { createAdmin, getAdmin } = require('../controllers/adminController');
const { createPoojaCategory, getPoojaCategory, getPoojaCategoryWeb ,deletePoojaCategory, getPoojaCategoryById, updatePoojaCategroy, updatePoojaCategoryStatus} = require('../controllers/poojaCategoryController');
const { createPooja, getPooja, getPoojaUser , getPoojaUserbyID, updatePoojaStatus, deletePooja, getPoojaById,updatePoojaById } = require('../controllers/poojaController');
const { createPoojaSamagri, getPoojaSamaagri,samagriByPoojaId } = require('../controllers/poojaSamagriController');
const { createSliderCategory,getSliderCategory, deleteSliderCategory, getSliderCategoryById, updateSliderCategory,updateSliderCategoryStatus} = require('../controllers/appSliderCategoryController');
const { createSlider,getSlider, getSliderUser, deleteSlider, getSliderById, updateSlider, updateSliderStatus } = require('../controllers/appSliderController');
const { createPandit,getPandits,loginPandit,updatePanditById, deletePanditById ,getPanditById } = require('../controllers/panditController');
const { getPanditsInRange }=require('../controllers/PanditRangeController')
const { sendOtp,verifyOtp } = require("../controllers/otpController");
const { addToCart,getCartItems,removeCartItem,removeAllCartItems} = require("../controllers/cartController");
const { createPoojaBooking,getOrder,addDeliveryAddress,getDeliveryAddress, getAllOrders,getAllOrdersWithAddress,updatePoojaBooking,getPoojaOrdersByUserId,acceptRejectBooking} = require("../controllers/orderController");
const { createTransaction } = require("../controllers/transactionController");
const { createBhajanCategory,getbhajanCategory,getbhajanCategoryUser,deletebhajanCategory,getbhajanCategoryById,updateBhajanCategory,updateBhajanCategoryStatus } = require("../controllers/bhajan_categoryController");
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
router.post('/location/', authenticateToken, createlocation);
router.get('/location/', authenticateToken, getlocation);
router.get('/pooja/all-pooja/', authenticateToken, getPooja);
router.post('/pooja/create-pooja/', authenticateToken, createPooja);
router.get('/pooja/all-poojaUser',authenticateToken,getPoojaUser);
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

router.post("/otp/send-otp", authenticateToken ,sendOtp);
router.post("/otp/verify-otp", authenticateToken,verifyOtp);
router.post("/cart/addCart",authenticateToken,addToCart);
router.get("/cart/get-cart/:id",authenticateToken,getCartItems);
router.delete("/cart/remove/:cart_id",authenticateToken,removeCartItem);
router.delete("/cart/clear/:user_id", authenticateToken,removeAllCartItems);
router.post("/transcation/create-transcation",authenticateToken,createTransaction);

router.post("/order/pooja-booking",authenticateToken, createPoojaBooking); // Create Product Order
router.get("/orders/:orderId",authenticateToken, getOrder); // Get Product Order Details
router.put("/orders/update-order",authenticateToken,updatePoojaBooking);
router.post("/order/delivery-address",authenticateToken, addDeliveryAddress); // Add Delivery Address
router.get("/order/delivery-address/:orderId",authenticateToken, getDeliveryAddress); // Get Delivery Address
router.get("/orders",authenticateToken,getAllOrders);
router.get('/order-address',authenticateToken,getAllOrdersWithAddress);
router.get("/orders/user/:userId",authenticateToken, getPoojaOrdersByUserId);
router.post("/orders/acceptReject",authenticateToken,acceptRejectBooking);
// Bhajan Mandal


router.post("/bhajanMandal/create-category",authenticateToken,createBhajanCategory);
router.get("/bhajanMandal/category",authenticateToken,getbhajanCategory);
router.get("/bhajanMandal/ctegory-user",authenticateToken,getbhajanCategoryUser);
router.delete("/bhajanMandal/delete-category/:id",authenticateToken,deletebhajanCategory);
router.get("/bhajanMandal/category-id/:id",authenticateToken,getbhajanCategoryById);
router.put("/bhajanMandal/update-category/:id",authenticateToken,updateBhajanCategory);
router.put("/bhajanMandal/update-category-status",authenticateToken,updateBhajanCategoryStatus);
module.exports = router;

