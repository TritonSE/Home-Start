export type VolunteerTag = {
  _id: string;
  name: string;
  color: string;
  type: string;
  __v?: number;
};

export type VolunteerAssignment = {
  _id: string;
  volunteerId: string;
  assignmentTagId: string | VolunteerTag;
  projectTagId: string | VolunteerTag;
  shiftTagIds: (string | VolunteerTag)[];
};

export type Address = {
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  zip?: string;
};

export type Volunteer = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  status?: "new" | "returning";
  dateCreated?: string | Date;
  effectiveDate?: string | Date;
  hours?: number;
  wageRate?: number;
  groupTagIds?: (string | VolunteerTag)[];
  programTagIds?: (string | VolunteerTag)[];
  additionalNotes?: string;
  address?: Address;
  birthday?: string | Date;
  preferredPronouns?: string;
  mediaConsent?: "yes" | "no";
  faceConsent?: "yes" | "no";
  nameConsent?: "first" | "full" | "no";
};

export type VolunteerWithTags = Volunteer & {
  tags: VolunteerTag[];
  projectTagIds?: VolunteerTag[];
};
