import dotenv from "dotenv";
import mongoose from "mongoose";

import { connectToDatabase } from "../database/connect";
import ProjectProgramMapModel from "../models/projectProgramMapModel";
import TagModel from "../models/tagModel";
import VolunteerAssignmentModel from "../models/volunteerAssignmentModel";
import VolunteerModel from "../models/volunteerModel";

dotenv.config();

type ProjectProgramPair = {
  projectName: string;
  programName: string;
};

const rawProjectProgramPairs: ProjectProgramPair[] = [
  { projectName: "Administrative Internship", programName: "Administrative" },
  { projectName: "Administrative Volunteer", programName: "Administrative" },
  { projectName: "Adopt a Family 2017", programName: "Philanthropy" },
  { projectName: "BackPack Drive 2022", programName: "Communities in Action" },
  { projectName: "BackPack Drive 2024", programName: "Communities in Action" },
  { projectName: "BHS Internship", programName: "Behavioral Health Services" },
  { projectName: "BHS Volunteer", programName: "Behavioral Health Services" },
  { projectName: "Blue Ribbon Broadcast 2021", programName: "Philanthropy" },
  { projectName: "Blue Ribbon Gala 2017", programName: "Philanthropy" },
  { projectName: "Blue Ribbon Gala 2018", programName: "Philanthropy" },
  { projectName: "Blue Ribbon Gala 2019", programName: "Philanthropy" },
  { projectName: "Blue Ribbon Gala 2022", programName: "Philanthropy" },
  { projectName: "Blue Ribbon Gala 2023", programName: "Philanthropy" },
  { projectName: "Blue Ribbon Gala 2024", programName: "Philanthropy" },
  { projectName: "Blue Ribbon Gala 2025", programName: "Philanthropy" },
  { projectName: "Blue Ribbon Gala Past", programName: "Philanthropy" },
  { projectName: "Board of Directors", programName: "Executive" },
  { projectName: "Bright Futures Candle", programName: "Finances" },
  { projectName: "CalFresh Program", programName: "Communities in Action" },
  { projectName: "CINA Internship", programName: "Communities in Action" },
  { projectName: "CINA Volunteer", programName: "Communities in Action" },
  { projectName: "Clinical Supervision", programName: "Behavioral Health Services" },
  { projectName: "Committee", programName: "Philanthropy" },
  { projectName: "CSF Internship", programName: "Community Services for Families" },
  { projectName: "CSF Volunteer", programName: "Community Services for Families" },
  { projectName: "DV Internship", programName: "Maternity Housing Program" },
  { projectName: "DV Volunteer", programName: "Maternity Housing Program" },
  { projectName: "East Youth Walk 2022", programName: "Maternity Housing Program" },
  { projectName: "East Youth Walk 2024", programName: "Maternity Housing Program" },
  { projectName: "EITC Volunteer", programName: "Communities in Action" },
  { projectName: "Event Committee", programName: "Philanthropy" },
  { projectName: "Executive Internship", programName: "Executive" },
  { projectName: "Executive Strategy", programName: "Executive" },
  { projectName: "F5FS Internship", programName: "First 5 First Steps" },
  { projectName: "F5FS Volunteer", programName: "First 5 First Steps" },
  { projectName: "Finances Committee", programName: "Finances" },
  { projectName: "Fiscal Internship", programName: "Finances" },
  { projectName: "Fiscal Volunteer", programName: "Finances" },
  { projectName: "Food Distribution", programName: "Family Self-Sufficiency Program" },
  { projectName: "FSS", programName: "Family Self-Sufficiency Program" },
  { projectName: "Hallo-Wine 2016", programName: "Philanthropy" },
  { projectName: "Hallo-Wine 2017", programName: "Philanthropy" },
  { projectName: "Hallo-Wine 2018", programName: "Philanthropy" },
  { projectName: "Hallo-Wine 2019", programName: "Philanthropy" },
  { projectName: "Hallo-Wine 2020", programName: "Philanthropy" },
  { projectName: "Hallo-Wine 2021", programName: "Philanthropy" },
  { projectName: "Hallo-Wine 2022", programName: "Philanthropy" },
  { projectName: "Hallo-Wine 2023", programName: "Philanthropy" },
  { projectName: "Hallo-Wine 2024", programName: "Philanthropy" },
  { projectName: "Hallo-Wine 2025", programName: "Philanthropy" },
  { projectName: "Hallo-Wine Past", programName: "Philanthropy" },
  { projectName: "Holiday Dropoff 2019", programName: "Philanthropy" },
  { projectName: "Housing Outreach Intern", programName: "Maternity Housing Program" },
  { projectName: "Housing Outreach Volunteer", programName: "Maternity Housing Program" },
  { projectName: "HR Internship", programName: "Human Resources" },
  { projectName: "HR Volunteer", programName: "Human Resources" },
  { projectName: "MHP Health Clinics", programName: "Maternity Housing Program" },
  { projectName: "MHP Internship", programName: "Maternity Housing Program" },
  { projectName: "MHP Volunteer", programName: "Maternity Housing Program" },
  { projectName: "Personnel Committee", programName: "Human Resources" },
  { projectName: "Philanthropy Internship", programName: "Philanthropy" },
  { projectName: "Philanthropy Resources Committee", programName: "Philanthropy" },
  { projectName: "Philanthropy Volunteer", programName: "Philanthropy" },
  { projectName: "PR Marketing", programName: "Philanthropy" },
  { projectName: "Rapid Rehousing Intern", programName: "Maternity Housing Program" },
  { projectName: "Rapid ReHousing Volunteer", programName: "Maternity Housing Program" },
  { projectName: "Storage Facility", programName: "Administrative" },
  { projectName: "Targeted Home Visiting", programName: "Maternity Housing Program" },
  { projectName: "Thrift Boutique", programName: "Finances" },
  { projectName: "Thrift Boutique Committee", programName: "Finances" },
  { projectName: "Toy Distribution 2016", programName: "Philanthropy" },
  { projectName: "Toy Distribution 2017", programName: "Philanthropy" },
  { projectName: "Toy Distribution 2018", programName: "Philanthropy" },
  { projectName: "Toy Distribution 2019", programName: "Philanthropy" },
  { projectName: "Toy Distribution 2020", programName: "Philanthropy" },
  { projectName: "Toy Distribution 2021", programName: "Philanthropy" },
  { projectName: "Toy Distribution 2022", programName: "Philanthropy" },
  { projectName: "Toy Distribution 2023", programName: "Philanthropy" },
  { projectName: "Toy Distribution 2024", programName: "Philanthropy" },
  { projectName: "VITA", programName: "Communities in Action" },
  { projectName: "VP Internship", programName: "Human Resources" },
  { projectName: "VP Volunteer", programName: "Human Resources" },
];

const normalizeProjectName = (projectName: string) => {
  const parts = projectName.trim().split(/\s+/);

  while (parts.length > 1) {
    const lastPart = parts[parts.length - 1];
    const looksLikeAbbreviation = /[a-z]/i.test(lastPart) && lastPart.length <= 5;

    if (!looksLikeAbbreviation) {
      break;
    }

    parts.pop();
  }

  return parts.join(" ");
};

const projectProgramPairs = rawProjectProgramPairs.map(({ projectName, programName }) => ({
  projectName: normalizeProjectName(projectName),
  programName,
}));

const TAG_COLOR_PALETTE = [
  { backgroundColor: "#F6E6E9", color: "#A40026" },
  { backgroundColor: "#F9EFE6", color: "#C46200" },
  { backgroundColor: "#F9F5EF", color: "#886F42" },
  { backgroundColor: "#E6F2EC", color: "#007F3F" },
  { backgroundColor: "#E6F2F3", color: "#007A8A" },
  { backgroundColor: "#E9ECF1", color: "#1D3A6B" },
  { backgroundColor: "#EFEBF3", color: "#452861" },
] as const;

const makeColorFromName = (name: string) => {
  let hash = 0;
  for (const character of name) {
    hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  }

  return TAG_COLOR_PALETTE[hash % TAG_COLOR_PALETTE.length].backgroundColor;
};

async function seed() {
  await connectToDatabase();

  try {
    await Promise.all([
      VolunteerAssignmentModel.deleteMany({}),
      ProjectProgramMapModel.deleteMany({}),
      VolunteerModel.deleteMany({}),
      TagModel.deleteMany({}),
    ]);

    const [assignmentTag, shiftTag] = await TagModel.create([
      { name: "Front Desk", color: TAG_COLOR_PALETTE[0].backgroundColor, type: "assignment" },
      { name: "Morning Shift", color: TAG_COLOR_PALETTE[1].backgroundColor, type: "shift" },
    ]);

    const [groupTagNorth, groupTagWest] = await TagModel.create([
      { name: "Northside Retail", color: makeColorFromName("Northside Retail"), type: "group" },
      { name: "West End Partners", color: makeColorFromName("West End Partners"), type: "group" },
    ]);

    const projectNames = [...new Set(projectProgramPairs.map((pair) => pair.projectName))];
    const programNames = [...new Set(projectProgramPairs.map((pair) => pair.programName))];

    const projectTags = await TagModel.create(
      projectNames.map((name) => ({
        name,
        color: makeColorFromName(name),
        type: "project" as const,
      })),
    );

    const programTags = await TagModel.create(
      programNames.map((name) => ({
        name,
        color: makeColorFromName(name),
        type: "program" as const,
      })),
    );

    const projectTagByName = new Map(projectTags.map((tag) => [tag.name, tag]));
    const programTagByName = new Map(programTags.map((tag) => [tag.name, tag]));
    const programNameByProjectName = new Map(
      rawProjectProgramPairs.map(({ projectName, programName }) => [
        normalizeProjectName(projectName),
        programName,
      ]),
    );

    await ProjectProgramMapModel.create(
      projectProgramPairs.map((pair) => ({
        projectTagId: projectTagByName.get(pair.projectName)?._id,
        programTagId: programTagByName.get(pair.programName)?._id,
      })),
    );

    const administrativeProjectTag = projectTagByName.get("Administrative Volunteer");
    const administrativeProgramTag = programTagByName.get("Administrative");
    const philanthropyProjectTag = projectTagByName.get("Philanthropy Volunteer");
    const philanthropyProgramTag = programTagByName.get("Philanthropy");

    if (
      !administrativeProjectTag ||
      !administrativeProgramTag ||
      !philanthropyProjectTag ||
      !philanthropyProgramTag
    ) {
      throw new Error("Required project or program tags were not created during seeding.");
    }

    const volunteerOne = await VolunteerModel.create({
      firstName: "Mia",
      lastName: "Fernandez",
      email: "mia.fernandez@example.org",
      phoneNumber: "5551234567",
      status: "new",
      address: {
        line1: "14 Maple Street",
        line2: "Apt 2",
        city: "Bristol",
        state: "VA",
        zip: "24201",
      },
      birthday: new Date("1991-06-11"),
      preferredPronouns: "she/her",
      effectiveDate: new Date("2026-01-10"),
      hours: 14.5,
      wageRate: 16.25,
      groupTagIds: [groupTagNorth._id],
      mediaConsent: "yes",
      faceConsent: "no",
      nameConsent: "full",
    });

    const volunteerTwo = await VolunteerModel.create({
      firstName: "Jordan",
      lastName: "Lee",
      email: "jordan.lee@example.org",
      phoneNumber: "5559876543",
      status: "returning",
      address: {
        line1: "88 River Road",
        city: "Kingsport",
        state: "TN",
        zip: "37660",
      },
      birthday: new Date("1987-02-19"),
      preferredPronouns: "they/them",
      effectiveDate: new Date("2025-09-15"),
      hours: 22,
      wageRate: 18,
      groupTagIds: [groupTagWest._id],
      mediaConsent: "no",
      faceConsent: "no",
      nameConsent: "first",
    });

    const [
      volunteerThree,
      volunteerFour,
      volunteerFive,
      volunteerSix,
      volunteerSeven,
      volunteerEight,
      volunteerNine,
      volunteerTen,
      volunteerEleven,
      volunteerTwelve,
    ] = await VolunteerModel.create([
      {
        firstName: "Sophia",
        lastName: "Patel",
        email: "sophia.patel@example.org",
        phoneNumber: "5551000001",
        status: "new",
        address: {
          line1: "21 Cedar Street",
          city: "Roanoke",
          state: "VA",
          zip: "24011",
        },
        birthday: new Date("1994-03-03"),
        preferredPronouns: "she/her",
        effectiveDate: new Date("2026-02-03"),
        hours: 9,
        wageRate: 15.5,
        groupTagIds: [groupTagNorth._id],
        mediaConsent: "yes",
        faceConsent: "no",
        nameConsent: "full",
      },
      {
        firstName: "Ethan",
        lastName: "Walker",
        email: "ethan.walker@example.org",
        phoneNumber: "5551000002",
        status: "returning",
        address: {
          line1: "404 Pine Avenue",
          city: "Kingsport",
          state: "TN",
          zip: "37660",
        },
        birthday: new Date("1989-07-18"),
        preferredPronouns: "he/him",
        effectiveDate: new Date("2025-11-20"),
        hours: 12,
        wageRate: 17.25,
        groupTagIds: [groupTagWest._id],
        mediaConsent: "no",
        faceConsent: "yes",
        nameConsent: "first",
      },
      {
        firstName: "Isabella",
        lastName: "Torres",
        email: "isabella.torres@example.org",
        phoneNumber: "5551000003",
        status: "new",
        address: {
          line1: "87 Birch Lane",
          city: "Bristol",
          state: "VA",
          zip: "24201",
        },
        birthday: new Date("1998-11-09"),
        preferredPronouns: "she/her",
        effectiveDate: new Date("2026-02-12"),
        hours: 7,
        wageRate: 15,
        groupTagIds: [groupTagNorth._id],
        mediaConsent: "yes",
        faceConsent: "no",
        nameConsent: "full",
      },
      {
        firstName: "Lucas",
        lastName: "Kim",
        email: "lucas.kim@example.org",
        phoneNumber: "5551000004",
        status: "returning",
        address: {
          line1: "19 Willow Drive",
          city: "Johnson City",
          state: "TN",
          zip: "37604",
        },
        birthday: new Date("1992-05-27"),
        preferredPronouns: "they/them",
        effectiveDate: new Date("2025-10-08"),
        hours: 16,
        wageRate: 18.5,
        groupTagIds: [groupTagWest._id],
        mediaConsent: "no",
        faceConsent: "no",
        nameConsent: "first",
      },
      {
        firstName: "Amelia",
        lastName: "Reed",
        email: "amelia.reed@example.org",
        phoneNumber: "5551000005",
        status: "new",
        address: {
          line1: "302 Spruce Street",
          city: "Bristol",
          state: "VA",
          zip: "24201",
        },
        birthday: new Date("1996-01-14"),
        preferredPronouns: "she/her",
        effectiveDate: new Date("2026-03-03"),
        hours: 10,
        wageRate: 15.75,
        groupTagIds: [groupTagNorth._id],
        mediaConsent: "yes",
        faceConsent: "yes",
        nameConsent: "full",
      },
      {
        firstName: "Noah",
        lastName: "Bennett",
        email: "noah.bennett@example.org",
        phoneNumber: "5551000006",
        status: "returning",
        address: {
          line1: "11 Hillcrest Road",
          city: "Kingsport",
          state: "TN",
          zip: "37660",
        },
        birthday: new Date("1984-08-23"),
        preferredPronouns: "he/him",
        effectiveDate: new Date("2025-08-21"),
        hours: 20,
        wageRate: 18,
        groupTagIds: [groupTagWest._id],
        mediaConsent: "no",
        faceConsent: "no",
        nameConsent: "first",
      },
      {
        firstName: "Harper",
        lastName: "Clark",
        email: "harper.clark@example.org",
        phoneNumber: "5551000007",
        status: "new",
        address: {
          line1: "56 Magnolia Court",
          city: "Bristol",
          state: "VA",
          zip: "24201",
        },
        birthday: new Date("1999-09-30"),
        preferredPronouns: "they/them",
        effectiveDate: new Date("2026-03-12"),
        hours: 8,
        wageRate: 15,
        groupTagIds: [groupTagNorth._id],
        mediaConsent: "yes",
        faceConsent: "no",
        nameConsent: "full",
      },
      {
        firstName: "Elijah",
        lastName: "Ross",
        email: "elijah.ross@example.org",
        phoneNumber: "5551000008",
        status: "returning",
        address: {
          line1: "72 Maple Ridge",
          city: "Abingdon",
          state: "VA",
          zip: "24210",
        },
        birthday: new Date("1988-12-04"),
        preferredPronouns: "he/him",
        effectiveDate: new Date("2025-12-04"),
        hours: 13,
        wageRate: 16.5,
        groupTagIds: [groupTagWest._id],
        mediaConsent: "no",
        faceConsent: "yes",
        nameConsent: "first",
      },
      {
        firstName: "Layla",
        lastName: "Morgan",
        email: "layla.morgan@example.org",
        phoneNumber: "5551000009",
        status: "new",
        address: {
          line1: "8 Oak Terrace",
          city: "Bristol",
          state: "VA",
          zip: "24201",
        },
        birthday: new Date("1997-04-16"),
        preferredPronouns: "she/her",
        effectiveDate: new Date("2026-03-20"),
        hours: 11,
        wageRate: 15.25,
        groupTagIds: [groupTagNorth._id],
        mediaConsent: "yes",
        faceConsent: "no",
        nameConsent: "full",
      },
      {
        firstName: "Mateo",
        lastName: "Nguyen",
        email: "mateo.nguyen@example.org",
        phoneNumber: "5551000010",
        status: "returning",
        address: {
          line1: "199 Cedar Hill",
          city: "Johnson City",
          state: "TN",
          zip: "37604",
        },
        birthday: new Date("1990-10-21"),
        preferredPronouns: "he/him",
        effectiveDate: new Date("2025-09-24"),
        hours: 18,
        wageRate: 17,
        groupTagIds: [groupTagWest._id],
        mediaConsent: "no",
        faceConsent: "no",
        nameConsent: "first",
      },
    ]);

    await VolunteerAssignmentModel.create([
      {
        volunteerId: volunteerOne._id,
        assignmentTagId: assignmentTag._id,
        projectTagId: administrativeProjectTag._id,
        shiftTagIds: [shiftTag._id],
      },
      {
        volunteerId: volunteerTwo._id,
        assignmentTagId: assignmentTag._id,
        projectTagId: administrativeProjectTag._id,
        shiftTagIds: [shiftTag._id],
      },
      {
        volunteerId: volunteerTwo._id,
        assignmentTagId: assignmentTag._id,
        projectTagId: philanthropyProjectTag._id,
        shiftTagIds: [],
      },
      {
        volunteerId: volunteerThree._id,
        assignmentTagId: assignmentTag._id,
        projectTagId: administrativeProjectTag._id,
        shiftTagIds: [shiftTag._id],
      },
      {
        volunteerId: volunteerThree._id,
        assignmentTagId: assignmentTag._id,
        projectTagId: projectTagByName.get("HR Volunteer")?._id,
        shiftTagIds: [],
      },
      {
        volunteerId: volunteerFour._id,
        assignmentTagId: assignmentTag._id,
        projectTagId: projectTagByName.get("BHS Volunteer")?._id,
        shiftTagIds: [shiftTag._id],
      },
      {
        volunteerId: volunteerFour._id,
        assignmentTagId: assignmentTag._id,
        projectTagId: projectTagByName.get("MHP Volunteer")?._id,
        shiftTagIds: [],
      },
      {
        volunteerId: volunteerFive._id,
        assignmentTagId: assignmentTag._id,
        projectTagId: projectTagByName.get("CSF Volunteer")?._id,
        shiftTagIds: [shiftTag._id],
      },
      {
        volunteerId: volunteerFive._id,
        assignmentTagId: assignmentTag._id,
        projectTagId: projectTagByName.get("F5FS Volunteer")?._id,
        shiftTagIds: [],
      },
      {
        volunteerId: volunteerSix._id,
        assignmentTagId: assignmentTag._id,
        projectTagId: projectTagByName.get("DV Volunteer")?._id,
        shiftTagIds: [shiftTag._id],
      },
      {
        volunteerId: volunteerSix._id,
        assignmentTagId: assignmentTag._id,
        projectTagId: projectTagByName.get("Housing Outreach Volunteer")?._id,
        shiftTagIds: [],
      },
      {
        volunteerId: volunteerSeven._id,
        assignmentTagId: assignmentTag._id,
        projectTagId: projectTagByName.get("EITC Volunteer")?._id,
        shiftTagIds: [shiftTag._id],
      },
      {
        volunteerId: volunteerSeven._id,
        assignmentTagId: assignmentTag._id,
        projectTagId: projectTagByName.get("Fiscal Volunteer")?._id,
        shiftTagIds: [],
      },
      {
        volunteerId: volunteerEight._id,
        assignmentTagId: assignmentTag._id,
        projectTagId: philanthropyProjectTag._id,
        shiftTagIds: [shiftTag._id],
      },
      {
        volunteerId: volunteerEight._id,
        assignmentTagId: assignmentTag._id,
        projectTagId: projectTagByName.get("PR Marketing")?._id,
        shiftTagIds: [],
      },
      {
        volunteerId: volunteerNine._id,
        assignmentTagId: assignmentTag._id,
        projectTagId: projectTagByName.get("Rapid ReHousing Volunteer")?._id,
        shiftTagIds: [shiftTag._id],
      },
      {
        volunteerId: volunteerNine._id,
        assignmentTagId: assignmentTag._id,
        projectTagId: projectTagByName.get("Targeted Home Visiting")?._id,
        shiftTagIds: [],
      },
      {
        volunteerId: volunteerTen._id,
        assignmentTagId: assignmentTag._id,
        projectTagId: projectTagByName.get("VP Volunteer")?._id,
        shiftTagIds: [shiftTag._id],
      },
      {
        volunteerId: volunteerTen._id,
        assignmentTagId: assignmentTag._id,
        projectTagId: projectTagByName.get("Storage Facility")?._id,
        shiftTagIds: [],
      },
      {
        volunteerId: volunteerEleven._id,
        assignmentTagId: assignmentTag._id,
        projectTagId: projectTagByName.get("VITA")?._id,
        shiftTagIds: [shiftTag._id],
      },
      {
        volunteerId: volunteerTwelve._id,
        assignmentTagId: assignmentTag._id,
        projectTagId: projectTagByName.get("Food Distribution")?._id,
        shiftTagIds: [],
      },
    ]);

    const assignments = await VolunteerAssignmentModel.find();
    const volunteerProgramTags = new Map<string, Set<string>>();

    for (const assignment of assignments) {
      const projectTag = projectTags.find(
        (tag) => String(tag._id) === String(assignment.projectTagId),
      );
      if (!projectTag) {
        continue;
      }

      const programName = programNameByProjectName.get(projectTag.name);
      if (!programName) {
        continue;
      }

      const programTag = programTagByName.get(programName);
      if (!programTag) {
        continue;
      }

      const volunteerId = String(assignment.volunteerId);
      if (!volunteerProgramTags.has(volunteerId)) {
        volunteerProgramTags.set(volunteerId, new Set());
      }

      volunteerProgramTags.get(volunteerId)?.add(String(programTag._id));
    }

    const updatePromises: Promise<any>[] = [];
    for (const [volunteerId, programTagIds] of volunteerProgramTags.entries()) {
      updatePromises.push(
        VolunteerModel.findByIdAndUpdate(volunteerId, {
          $set: { programTagIds: [...programTagIds] },
        }),
      );
    }
    await Promise.all(updatePromises);

    // eslint-disable-next-line no-console
    console.log("Seeded volunteers, tags, assignments, and project-program mappings.");
  } finally {
    await mongoose.disconnect();
  }
}

void seed().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
