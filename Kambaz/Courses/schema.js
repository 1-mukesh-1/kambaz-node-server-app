import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const courseSchema = new mongoose.Schema({
   _id: { 
     type: String, 
     default: uuidv4
   },
   name: { type: String, required: true },
   number: { type: String, required: true },
   startDate: String,
   endDate: String,
   department: String,
   credits: { type: Number, default: 3 },
   description: String,
   author: String,
 },
 { collection: "courses" }
);