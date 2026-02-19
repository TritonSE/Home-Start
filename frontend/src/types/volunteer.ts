import { Tag } from "./tag";

export type Volunteer = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  tags: Tag[];
};
