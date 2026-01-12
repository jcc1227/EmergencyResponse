import mongoose from 'mongoose';

export const connectDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    // Configure connection options to be more resilient to transient network issues
    await mongoose.connect(mongoUri, {
      // how long to try selecting a server (ms)
      serverSelectionTimeoutMS: 10000,
      // how long a socket can be idle before timing out (ms)
      socketTimeoutMS: 45000,
      // family: 4 forces IPv4 (helps on some networks)
      family: 4,
      // use TLS when connecting to Atlas (should be inferred from URI)
    });
    
    console.log('✅ Connected to MongoDB Atlas');
    
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('🔁 MongoDB reconnected');
    });

  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error);
    process.exit(1);
  }
};

export default mongoose;
