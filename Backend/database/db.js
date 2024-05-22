import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(`mongodb+srv://jemmy33jd:Mongodb.33@cluster0.1auwi0e.mongodb.net/docs_db`, {
        });
    
        console.log(`MongoDB Connected`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
    };

export default connectDB;
