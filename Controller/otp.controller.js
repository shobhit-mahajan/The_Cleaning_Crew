import Otps from '../Model/EmailVerification.models.js';
import randomstring from 'randomstring


const generateOtp = () =>{
               return randomstring.generate({
                              length:6,
                              charset:'numeric'
               })
}
export const SendOtp = async(req,res,next)=>{
try {
            const {Email} = req.body   
} catch (error) {
              console.log(error) 
}
}
