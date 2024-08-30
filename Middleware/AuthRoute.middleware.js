import jwt, { decode } from "jsonwebtoken";
import dotenv from 'dotenv';
dotenv.config()
export const AuthRouteKMiddleware = async (req, res, next) => {
  try {
//     const token = req.headers["authorization"].split(" ")[1];
const token = req.headers["authorization"].split(" ")[1];
    console.log(token)
    jwt.verify(token, process.env.JWT_KEY, (err, decode) => {
      if (err) {
        return res
          .status(201)
          .json({ success: false, message: "Something wrong" ,err});
      } else {
        req.body.id = decode.id;
        next();
      }
    });
  } catch (error) {
    res
      .status(400)
      .json({
        success: false,
        message: "something went wrong in authorization",
      });
  }
};
