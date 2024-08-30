
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  FirstName: {
    type: String,
    required: true,
  },
  LastName: {
    type: String,
    required: true,
  },
  Email: {
    type: String,
    required: true,
    unique: true,
  },
  Password: {
    type: String,
    required: true,
  },
  verified:{
    type:Boolean,
    default:false
  }
});
const UserDetail = mongoose.model("UserDetail", UserSchema);
export default UserDetail;
