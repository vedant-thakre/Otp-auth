import express from 'express';
import { changePassword, forgotPassword, login, matchOtp, register } from '../Controllers/userControllers.js';

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/forgot-password/matchotp", matchOtp);
router.post("/forgot-password/changepassword", changePassword);


export default router;
