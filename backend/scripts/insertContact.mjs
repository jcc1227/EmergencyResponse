#!/usr/bin/env node
import 'dotenv/config';
import mongoose from 'mongoose';

async function main(){
  try{
    const uri = process.env.MONGODB_URI;
    if(!uri){
      console.error('MONGODB_URI not set in environment. Aborting.');
      process.exit(1);
    }

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      family: 4,
    });

    console.log('Connected to MongoDB, inserting sample contact...');

    const contact = {
      userId: new mongoose.Types.ObjectId(),
      name: 'Sample Contact',
      phone: '555-0101',
      isPrimary: false,
      relationship: 'Friend',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const res = await mongoose.connection.collection('contacts').insertOne(contact);
    console.log('Inserted contact with _id =', res.insertedId.toString());

    // Fetch and print all contacts for this user
    const docs = await mongoose.connection.collection('contacts').find({ userId: contact.userId }).toArray();
    console.log('Contacts for userId', contact.userId.toString(), docs.length);
    console.dir(docs, { depth: null });

    await mongoose.disconnect();
    process.exit(0);
  }catch(err){
    console.error('Error inserting contact:', err);
    try{ await mongoose.disconnect(); }catch(_){}
    process.exit(1);
  }
}

main();
