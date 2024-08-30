import express from 'express'
import { AdminPanel, AuthVerification, Login, Regsiter,  verifyOtp } from '../Controller/Auth.controller.js';
import { AuthRouteKMiddleware } from '../Middleware/AuthRoute.middleware.js';
import { AllAppoinment, BookingAppoinment, CheckBookingStatus, UpdateBookingStatus } from '../Controller/Booking.controller.js';
import { processPayment } from '../Controller/Payment.controller.js';


const router = express.Router();

router.post('/register',Regsiter);
router.post('/login',Login);
router.post('/userData',AuthRouteKMiddleware,AuthVerification)
router.post('/verifyotp',verifyOtp);
router.post('/book',BookingAppoinment)
router.get('/booking/Status/:id', CheckBookingStatus);
router.post('/payment/:bookingId',processPayment)
router.get('/admindashboard',AdminPanel);
router.get('/admingetbooking',AllAppoinment);
router.post('/updateBookingStatus',UpdateBookingStatus);
export default router;