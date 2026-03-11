export type VolunteerTag = {
  _id: string;
  name: string;
  color: string;
  type: string;
  __v?: number;
};

export type Volunteer = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  tags: VolunteerTag[];
  status?: "new" | "returning";
  volunteerTypeTags?: string[];
  events?: string[];
  additionalNotes?: string;
};
