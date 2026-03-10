import "dotenv/config";

import { connectToDatabase } from "../database/connect";
import Tag from "../models/tagModel";
import Volunteer from "../models/volunteerModel";

async function seedVolunteers() {
  await connectToDatabase();

  await Volunteer.deleteMany({});
  await Tag.deleteMany({});

  const seededTags = await Tag.insertMany([
    { name: "Intern", color: "#3B82F6", type: "Volunteer Type" },
    { name: "Outside Volunteer", color: "#F59E0B", type: "Volunteer Type" },
    { name: "2+ More", color: "#10B981", type: "Event" },
  ]);

  const tagIds = seededTags.map((tag) => tag._id);

  await Volunteer.insertMany([
    {
      firstName: "Jane",
      lastName: "Doe",
      email: "jane@example.com",
      phoneNumber: "555-123-4567",
      tags: tagIds,
    },
    {
      firstName: "John",
      lastName: "Smith",
      email: "john@example.com",
      phoneNumber: "555-987-6543",
      tags: tagIds,
    },
    {
      firstName: "Alice",
      lastName: "Johnson",
      email: "alice@example.com",
      phoneNumber: "555-222-3344",
      tags: tagIds,
    },
    {
      firstName: "Michael",
      lastName: "Brown",
      email: "michael@example.com",
      phoneNumber: "555-333-7788",
      tags: tagIds,
    },
    {
      firstName: "Sarah",
      lastName: "Lee",
      email: "sarah@example.com",
      phoneNumber: "555-444-9911",
      tags: tagIds,
    },
    {
      firstName: "David",
      lastName: "Kim",
      email: "david@example.com",
      phoneNumber: "555-555-1212",
      tags: tagIds,
    },
    {
      firstName: "Emily",
      lastName: "Martinez",
      email: "emily@example.com",
      phoneNumber: "555-666-3434",
      tags: tagIds,
    },
    {
      firstName: "Chris",
      lastName: "Wilson",
      email: "chris@example.com",
      phoneNumber: "555-777-5656",
      tags: tagIds,
    },
    {
      firstName: "Olivia",
      lastName: "Nguyen",
      email: "olivia@example.com",
      phoneNumber: "555-888-7878",
      tags: tagIds,
    },
    {
      firstName: "Daniel",
      lastName: "Anderson",
      email: "daniel@example.com",
      phoneNumber: "555-999-9090",
      tags: tagIds,
    },
  ]);

  console.info("Volunteers seeded");
  process.exit(0);
}

seedVolunteers().catch(console.error);
