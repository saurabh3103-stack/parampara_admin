const express = require('express');
const router = express.Router();
const authenticateToken = require('../middlewares/authMiddleware');  // Import the middleware
const { createUser, getUsers } = require('../controllers/userController');
const { createlocation,getlocation } = require('../controllers/locationController');
const { createAdmin,getAdmin } = require('../controllers/adminController');
const { createPoojaCategory,getPoojaCategory } = require('../controllers/poojaCategoryController');
const { createPooja,getPooja } = require('../controllers/poojaController');
const { createPoojaSamagri,getPoojaSamaagri } = require('../controllers/poojaSamagriController');


// Define all routes
router.post('/admin/',authenticateToken,createAdmin);
router.get('/admin/',authenticateToken,getAdmin);
router.post('/user/',authenticateToken, createUser);
router.get('/user/',authenticateToken, getUsers);
router.post('/location/',authenticateToken,createlocation);
router.get('/location/',authenticateToken,getlocation);
router.get('/pooja/',authenticateToken,getPooja);
router.post('/pooja/',authenticateToken,createPooja);
router.get('/pooja/category',authenticateToken,getPoojaCategory);
router.post('/pooja/category',authenticateToken,createPoojaCategory);
router.get('/pooja/samagri',authenticateToken,getPoojaSamaagri);
router.post('/pooja/samagri',authenticateToken,createPoojaSamagri);


module.exports = router;
