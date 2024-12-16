const multer = require('multer');
const fs = require('fs');
const path = require('path');
const PoojaCategory = require('../models/PoojaCategory');

const ensureDirectoryExistence = (folderPath) => {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true }); 
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folderPath = path.join(__dirname, '..', 'public', 'uploads', 'pooja_categories');
    ensureDirectoryExistence(folderPath); 
    cb(null, folderPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`; 
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and JPG are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, 
}).single('pooja_image');


exports.createPoojaCategory = [
  upload,
  async (req, res) => {
    try {
      const { ...poojaCategoryDetails } = req.body;

      let poojaImageUrl = null;

      if (req.file) {
        poojaImageUrl = `/uploads/pooja_categories/${req.file.filename}`; 
      }
      const addPoojaCategory = new PoojaCategory({
        ...poojaCategoryDetails,
        pooja_image: poojaImageUrl, 
      });

      await addPoojaCategory.save();

      return res.status(200).json({
        message: 'Pooja category created successfully.',
        data: addPoojaCategory,
        status: 1,
      });
    } catch (error) {
      res.status(500).json({
        message: error.message,
        status: 0,
      });
    }
  },
];


exports.getPoojaCategory = async (req, res) => {
  try {
    const poojaCategory = await PoojaCategory.find();
    res.status(200).json({
      message: 'Pooja Category Data',
      status: 1,
      data: poojaCategory,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      status: 0,
    });
  }
};

exports.getPoojaCategoryWeb = async (req, res) => {
  try {
    const poojaCategoryWeb = await PoojaCategory.find({ status: "active" });
    res.status(200).json({
      message: 'Pooja Category Data For Web',
      status: 1,
      data: poojaCategoryWeb,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      status: 0,
    });
  }
};

exports.deletePoojaCategory = async(req, res)=> {
  try{
    const { id } = req.params;
    const poojaCategory = await PoojaCategory.findById(id);
    if(!poojaCategory){
      return res.status(404).json({message:"Pooja Category not found",status:0});
    }
    if(poojaCategory.pooja_image){
      const imagePath = path.join(__dirname, '..', 'public', poojaCategory.pooja_image);
      if(fs.existsSync(imagePath)){
        fs.unlinkSync(imagePath);
      }
    }
    await PoojaCategory.findByIdAndDelete(id);
    res.status(200).json({message:"Pooja Category deleted successfully",status:1,});
  }
  catch (error)
  {
    res.status(500).json({message:error.message,status:0});
  }
};

exports.getPoojaCategoryById = async (req,res)=>{
  try{
    const { id } = req.params;
    const poojaCategory = await PoojaCategory.findById(id);
    if(!poojaCategory){
      return res.status(404).json({message:"Pooja Category not Found.",status:0});
    }
    res.status(200).json({message:"Pooja Category data retrieved successfully.",status:1,data:poojaCategory,});
  }catch(error){
    res.status(500).json({message:error.message,status:0});
  }
};
exports.updatePoojaCategroy = [
  upload,
  async (req, res)=>{
    try{
      const { id } = req.params;
      const { ...updatedDetails } = req.body;
      let poojaCategroy = await PoojaCategory.findById(id);
      if(!poojaCategroy){
        return res.status(400).json({message:'Pooja category not found',status:0});
      }
      if(req.file){
        if(poojaCategroy.pooja_image){
          const oldImagePath = path.join(__dirname, '..', 'public', poojaCategory.pooja_image);
          if(fs.existsSync(oldImagePath)){
            fs.unlinkSync(oldImagePath);
          }
        }
        updatedDetails.pooja_image=`/uploads/pooja_categories/${req.file.filename}`;
      } 
      poojaCategory = await PoojaCategory.findByIdAndUpdate(
        id,
        {$set : updatedDetails},
        {new : true}
      );
      res.status(200).json({'message':'Pooja category update successfullty',status:1,data:poojaCategory,});
    }
    catch(error){
      res.status(500).json({message:error.message,status:0,});
    }
  },
];
exports.updatePoojaCategoryStatus = async (req, res) => {
  try {
    const { poojacategoryId, newStatus } = req.body;

    if (!poojacategoryId || !newStatus) {
      return res.status(400).json({ message: 'Pooja category ID and status are required.', status: 0 });
    }

    const updatedPoojaCategory = await PoojaCategory.findByIdAndUpdate(
      poojacategoryId,
      { status: newStatus },
      { new: true }
    );

    if (!updatedPoojaCategory) {
      return res.status(404).json({ message: 'Pooja category not found.', status: 0 });
    }

    res.status(200).json({ message: 'Pooja category status updated successfully', data: updatedPoojaCategory, status: 1 });
  } catch (error) {
    res.status(500).json({ message: error.message, status: 0 });
  }
};









// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import Breadcrumb from '../../Component/Breadcrumb';
// import ProfileMenu from '../Pandit/ProfileMenu';
// import { fetchPanditDetails } from "./PanditApiServices";
// import { Link } from "react-router-dom";
// const Profile = () => {
//     const breadcrumbLinks = [
//         { label: 'Home', url: '/' },
//         { label: 'Pandit', url: 'javascript:void(0)' },
//         { label: 'My Account', url: 'javascript:void(0)'},
//         { pagename : 'My Account'},
//       ];

//        const [profileData,setProfileData]=useState([])
          
      
//           useEffect(() => {
//             const fetchDetails = async () => {
//               const storedEmail = sessionStorage.getItem("storedEmail");
//               if (!storedEmail) {
//                 console.error("No email found in sessionStorage");
//                 return;
//               }
        
//               try {
//                 const data = await fetchPanditDetails(storedEmail, import.meta.env.VITE_TOKEN); // Call service function
//                 setProfileData(data); // Update state with fetched data
//                 console.log("Fetched Pandit Details:", data);
//               } catch (error) {
//                 console.error("Error fetching Pandit details:", error.message);
//               }
//             };
        
//             fetchDetails();
//           }, [import.meta.env.VITE_TOKEN]);
//           console.log(profileData)
         

//           const [activeTab, setActiveTab] = useState("personalDetails");

//           const tabs = [
//             { id: "personalDetails", label: "Personal Details" },
//             { id: "bankDetails", label: "Bank Details" },
//             { id: "addressDetails", label: "Address Details" },
//             { id: "otherDetails", label: "Other Details" },
//           ];
//     return (
//         <>
//            <section className="bg-orange-50 min-h-screen py-6">
//   <div className="mx-auto w-full space-y-6 px-4 text-sm xl:max-w-7xl">
//     <h1 className="text-3xl font-extrabold text-orange-600 sm:text-4xl">My Account</h1>

//     {/* Profile Header */}
//     <div className="rounded-lg border border-orange-200 bg-white shadow-lg">
//       <div className="flex flex-col space-y-6 px-6 py-6 sm:flex-row sm:space-y-0 sm:items-center sm:justify-between">
//         {/* Profile Image and Info */}
//         <div className="flex space-x-4">
//           <img
//             className="h-24 w-24 rounded-full border-4 border-orange-500 p-[2px]"
//             src={`import.meta.env.VITE_PARAMPARA_APIURL+ ${profileData?.image} `}
//             alt={profileData?.username || "Profile Image"}
//           />
//           <div>
//             <h2 className="text-xl font-semibold text-orange-700">{profileData?.username}</h2>
//             <p className="text-gray-500">Account ID: #ECX12345</p>
//             <p className="text-gray-500">
//               <i className="fas fa-envelope mr-1"></i> {profileData?.email}
//             </p>
//             <p className="text-gray-500">
//               <i className="fas fa-user mr-1"></i> Customer
//             </p>
//           </div>
//         </div>
//         {/* Profile Overview */}
//         <div className="text-orange-700">
//           <p className="font-medium">Country: {profileData?.country || "Not Provided"}</p>
//           <p className="font-medium">City: {profileData?.city || "Not Provided"}</p>
//         </div>
//       </div>
//     </div>

//     {/* Tabs Section */}
//     <div className="rounded-lg border border-orange-200 bg-white shadow-lg">
//       {/* Tabs Menu */}
//       <div className="flex border-b border-orange-200">
//         {tabs.map((tab) => (
//           <button
//             key={tab.id}
//             onClick={() => setActiveTab(tab.id)}
//             className={`flex-1 px-4 py-3 text-center text-sm font-semibold transition-colors ${
//               activeTab === tab.id
//                 ? "bg-orange-500 text-white"
//                 : "bg-gray-100 text-gray-500 hover:bg-orange-100"
//             }`}
//           >
//             {tab.label}
//           </button>
//         ))}
//       </div>

//       {/* Tab Content */}
//       <div className="p-6">
//         {activeTab === "personalDetails" && (
//           <div className="space-y-3">
//             <h2 className="text-lg font-semibold text-orange-600">Personal Details</h2>
<Link to="/pandit/edit-profile">
<div class="btn-gradient w-28 sm:w-40" >Edit Profile</div>
</Link>
//             <p><span className="font-medium">Full Name:</span> {profileData?.username}</p>
//             <p><span className="font-medium">Date of Birth:</span> {profileData?.dob || "Not Provided"}</p>
//             <p><span className="font-medium">Phone:</span> {profileData?.mobile || "Not Provided"}</p>
//             <p><span className="font-medium">Email:</span> {profileData?.email}</p>
//           </div>
//         )}

//         {activeTab === "bankDetails" && (
//           <div className="space-y-3">
//             <h2 className="text-lg font-semibold text-orange-600">Bank Details</h2>
//             <p><span className="font-medium">Bank Name:</span> {profileData?.bank_name || "Not Provided"}</p>
//             <p><span className="font-medium">Account No:</span> {profileData?.bank_ac_no || "Not Provided"}</p>
//             <p><span className="font-medium">IFSC Code:</span> {profileData?.ifsc_code || "Not Provided"}</p>
//           </div>
//         )}

//         {activeTab === "addressDetails" && (
//           <div className="space-y-3">
//             <h2 className="text-lg font-semibold text-orange-600">Address Details</h2>
//             <p><span className="font-medium">Address:</span> {profileData?.address || "Not Provided"}</p>
//             <p><span className="font-medium">City:</span> {profileData?.city || "Not Provided"}</p>
//             <p><span className="font-medium">State:</span> {profileData?.state || "Not Provided"}</p>
//             <p><span className="font-medium">Pincode:</span> {profileData?.pincode || "Not Provided"}</p>
//           </div>
//         )}

//         {activeTab === "otherDetails" && (
//           <div className="space-y-3">
//             <h2 className="text-lg font-semibold text-orange-600">Other Details</h2>
//             <p><span className="font-medium">Degree:</span> {profileData?.degree || "Not Provided"}</p>
//             <p><span className="font-medium">Skills:</span> {profileData?.skills || "Not Provided"}</p>
//             <p><span className="font-medium">Experience:</span> {profileData?.experience || "0"} years</p>
//           </div>
//         )}
//       </div>
//     </div>
//   </div>
// </section>

//         </>
//     );
// }


// export default Profile;