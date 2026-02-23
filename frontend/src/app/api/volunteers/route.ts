import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

// This runs when someone visits /api/volunteers
export async function GET() {
  // 1. Connect to MongoDB
  const client = new MongoClient(process.env.MONGODB_URI!);

  try {
    await client.connect();

    // 2. Get your database and collection (like a table)
    const database = client.db("your_database_name");
    const volunteers = database.collection("volunteers");

    // 3. Fetch all volunteers
    const allVolunteers = await volunteers.find({}).toArray();

    // 4. Send data back to frontend
    return NextResponse.json(allVolunteers);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch volunteers" }, { status: 500 });
  } finally {
    // 5. Close connection
    await client.close();
  }
}
