export type Volunteer = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  tags: string[];
  statusTags?: string[];
  volunteerTypeTags?: string[];
  events?: string[];
  additionalNotes?: string;
};
