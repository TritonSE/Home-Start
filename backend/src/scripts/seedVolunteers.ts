import "dotenv/config";

import { connectToDatabase } from "../database/connect";
import Volunteer from "../models/volunteerModel";

async function seedVolunteers() {
  await connectToDatabase();

  await Volunteer.deleteMany({}); // Clear existing volunteers

  await Volunteer.insertMany([
    {
      firstName: "Jane",
      lastName: "Doe",
      email: "jane@example.com",
      phoneNumber: "555-123-4567",
      tags: ["food-bank", "weekend"],
    },
    {
      firstName: "John",
      lastName: "Smith",
      email: "john@example.com",
      phoneNumber: "555-987-6543",
      tags: ["medical"],
    },
    {
      firstName: "Alice",
      lastName: "Johnson",
      email: "alice@example.com",
      phoneNumber: "555-222-3344",
      tags: ["intern", "weekday"],
    },
    {
      firstName: "Michael",
      lastName: "Brown",
      email: "michael@example.com",
      phoneNumber: "555-333-7788",
      tags: ["outside-volunteer"],
    },
    {
      firstName: "Sarah",
      lastName: "Lee",
      email: "sarah@example.com",
      phoneNumber: "555-444-9911",
      tags: ["food-bank", "medical"],
    },
    {
      firstName: "David",
      lastName: "Kim",
      email: "david@example.com",
      phoneNumber: "555-555-1212",
      tags: ["weekend"],
    },
    {
      firstName: "Emily",
      lastName: "Martinez",
      email: "emily@example.com",
      phoneNumber: "555-666-3434",
      tags: ["intern"],
    },
    {
      firstName: "Chris",
      lastName: "Wilson",
      email: "chris@example.com",
      phoneNumber: "555-777-5656",
      tags: ["food-bank"],
    },
    {
      firstName: "Olivia",
      lastName: "Nguyen",
      email: "olivia@example.com",
      phoneNumber: "555-888-7878",
      tags: ["medical", "weekend"],
    },
    {
      firstName: "Daniel",
      lastName: "Anderson",
      email: "daniel@example.com",
      phoneNumber: "555-999-9090",
      tags: ["outside-volunteer", "weekday"],
    },
  ]);

  console.log("Volunteers seeded");
  process.exit(0);
}

seedVolunteers().catch(console.error);
