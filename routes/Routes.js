const express = require('express');
const router = express.Router();
const { createUser, getUsers } = require('../controllers/userController');
const { createlocation,getlocation } = require('../controllers/locationController');
const { createAdmin,getAdmin } = require('../controllers/adminController');
const { createPoojaCategory,getPoojaCategory } = require('../controllers/poojaCategoryController');
const { createPooja,getPooja } = require('../controllers/poojaController');
const { createPoojaSamagri,getPoojaSamaagri } = require('../controllers/poojaSamagriController');


// Define all routes
router.post('/admin/',createAdmin);
router.get('/admin/',getAdmin);
router.post('/user/', createUser);
router.get('/user/', getUsers);
router.post('/location/',createlocation);
router.get('/location/',getlocation);
router.get('/pooja/',getPooja);
router.post('/pooja/',createPooja);
router.get('/pooja/category',getPoojaCategory);
router.post('/pooja/category',createPoojaCategory);
router.get('/pooja/samagri',getPoojaSamaagri);
router.post('/pooja/samagri',createPoojaSamagri);


module.exports = router;
