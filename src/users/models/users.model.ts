import { Schema, model } from "mongoose";
import { IUser } from "../interfaces/users.interface";

const UserSchema = new Schema<IUser>({
  firstName: String,
  lastName: String,
  email: {type: String, required: true},
  password: {type: String, select: false},
  permissionsFlag: Number
});

export default model<IUser>('User', UserSchema);
