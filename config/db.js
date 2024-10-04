import mongoose from "mongoose";
import colors from "colors";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongoServer; // this is in memory db for unit testing

export const connectDB = async () => {
    try {
        // Check if running in test environment
        if (process.env.NODE_ENV === 'test') {
            // if test, we use in memory database
            mongoServer = await MongoMemoryServer.create();
            const uri = mongoServer.getUri();
            await mongoose.connect(uri, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            });
            console.log(`Connected to in-memory MongoDB at ${uri}`.bgMagenta.white);
        } else {
            // Connect to the actual MongoDB database
            const conn = await mongoose.connect(process.env.MONGO_URL, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            });
            console.log(`Connected To MongoDB Database ${conn.connection.host}`.bgMagenta.white);
        }
    } catch (error) {
        console.log(`Error in MongoDB connection: ${error}`.bgRed.white);
    }
};

// Function to disconnect from the database, useful for test cleanup
export const disconnectDB = async () => {
    try {
        await mongoose.connection.close();
        if (mongoServer) {
            await mongoServer.stop(); // Stop the in-memory server if it was started
        }
        console.log(`Disconnected from MongoDB`.bgYellow.white);
    } catch (error) {
        console.log(`Error disconnecting from MongoDB: ${error}`.bgRed.white);
    }
};

