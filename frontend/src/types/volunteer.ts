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
  updated: Date;
  created: Date;
  tags: VolunteerTag[];
  status: "new" | "returning";
};
