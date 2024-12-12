const express = require('express');
const jwt = require("jsonwebtoken");
const router = express.Router();
const { signin, authenticateToken } = require('../middlewares/authMiddleware');  // Import the functions

const { createUser, getUsers,loginUser } = require('../controllers/userController');
const { createlocation, getlocation } = require('../controllers/locationController');
const { createAdmin, getAdmin } = require('../controllers/adminController');
const { createPoojaCategory, getPoojaCategory, getPoojaCategoryWeb ,deletePoojaCategory, getPoojaCategoryById, updatePoojaCategroy, updatePoojaCategoryStatus} = require('../controllers/poojaCategoryController');
const { createPooja, getPooja, getPoojaUser , updatePoojaStatus, deletePooja, getPoojaById,updatePoojaById } = require('../controllers/poojaController');
const { createPoojaSamagri, getPoojaSamaagri,samagriByPoojaId } = require('../controllers/poojaSamagriController');
const { createSliderCategory,getSliderCategory, deleteSliderCategory, getSliderCategoryById, updateSliderCategory,updateSliderCategoryStatus} = require('../controllers/appSliderCategoryController');
const { createSlider,getSlider, getSliderUser, deleteSlider, getSliderById, updateSlider, updateSliderStatus } = require('../controllers/appSliderController');
const { createPandit,getPandits,loginPandit } = require('../controllers/panditController');
// Define other routes (existing ones)
router.post('/signin', signin);
router.post('/admin/', authenticateToken, createAdmin);
router.get('/admin/', authenticateToken, getAdmin);
router.post('/user/create-user', authenticateToken, createUser);
router.get('/user/all-user', authenticateToken, getUsers);
router.post('/user/login',authenticateToken, loginUser);
router.post('/location/', authenticateToken, createlocation);
router.get('/location/', authenticateToken, getlocation);
router.get('/pooja/all-pooja/', authenticateToken, getPooja);
router.post('/pooja/create-pooja/', authenticateToken, createPooja);
router.get('/pooja/all-poojaUser',authenticateToken,getPoojaUser);
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
router.get('slider/get-slider',authenticateToken,getSliderUser);
router.post('/pandit/create-pandit',authenticateToken,createPandit);
router.get('/pandit/all-pandit',authenticateToken,getPandits);
router.post('/pandit/login-pandit',authenticateToken,loginPandit);


module.exports = router;


