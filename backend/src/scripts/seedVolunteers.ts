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
      tags: ["Intern", "Outside Volunteer", "2+ More"],
    },
    {
      firstName: "John",
      lastName: "Smith",
      email: "john@example.com",
      phoneNumber: "555-987-6543",
      tags: ["Intern", "Outside Volunteer", "2+ More"],
    },
    {
      firstName: "Alice",
      lastName: "Johnson",
      email: "alice@example.com",
      phoneNumber: "555-222-3344",
      tags: ["Intern", "Outside Volunteer", "2+ More"],
    },
    {
      firstName: "Michael",
      lastName: "Brown",
      email: "michael@example.com",
      phoneNumber: "555-333-7788",
      tags: ["Intern", "Outside Volunteer", "2+ More"],
    },
    {
      firstName: "Sarah",
      lastName: "Lee",
      email: "sarah@example.com",
      phoneNumber: "555-444-9911",
      tags: ["Intern", "Outside Volunteer", "2+ More"],
    },
    {
      firstName: "David",
      lastName: "Kim",
      email: "david@example.com",
      phoneNumber: "555-555-1212",
      tags: ["Intern", "Outside Volunteer", "2+ More"],
    },
    {
      firstName: "Emily",
      lastName: "Martinez",
      email: "emily@example.com",
      phoneNumber: "555-666-3434",
      tags: ["Intern", "Outside Volunteer", "2+ More"],
    },
    {
      firstName: "Chris",
      lastName: "Wilson",
      email: "chris@example.com",
      phoneNumber: "555-777-5656",
      tags: ["Intern", "Outside Volunteer", "2+ More"],
    },
    {
      firstName: "Olivia",
      lastName: "Nguyen",
      email: "olivia@example.com",
      phoneNumber: "555-888-7878",
      tags: ["Intern", "Outside Volunteer", "2+ More"],
    },
    {
      firstName: "Daniel",
      lastName: "Anderson",
      email: "daniel@example.com",
      phoneNumber: "555-999-9090",
      tags: ["Intern", "Outside Volunteer", "2+ More"],
    },
  ]);

  process.exit(0);
}

seedVolunteers().catch(console.error);
