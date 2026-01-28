import fs from "node:fs";
import { PassThrough } from "node:stream";

import csvParser from "csv-parser";
import { validationResult } from "express-validator";

import VolunteerModel from "../models/volunteerModel";
import validationErrorParser from "../util/validationErrorParser";

import type { RequestHandler } from "express";

export const getVolunteer: RequestHandler = async (req, res, next) => {
  const volunteerId = req.params.id;

  try {
    const volunteer = await VolunteerModel.findById(volunteerId);

    if (!volunteer) {
      return res.status(404).json({ error: "Could not find volunteer" });
    }

    res.status(200).json(volunteer);
  } catch (err) {
    next(err);
  }
};
export const getVolunteers: RequestHandler = async (req, res, next) => {
  try {
    const volunteers = await VolunteerModel.find();
    res.status(200).json(volunteers);
  } catch (err) {
    next(err);
  }
};

type VolunteerByEmailBody = {
  email: string;
};

export const getVolunteerByEmail: RequestHandler = async (req, res, next) => {
  const { email } = req.body as VolunteerByEmailBody;

  try {
    const volunteer = await VolunteerModel.findOne({ email });
    if (!volunteer) {
      return res.status(404).json({ error: "Could not find volunteer" });
    }
    res.status(200).json(volunteer);
  } catch (err) {
    next(err);
  }
};

type VolunteerByPhoneNumberBody = {
  phoneNumber: string;
};

export const getVolunteerPhoneNumber: RequestHandler = async (req, res, next) => {
  const { phoneNumber } = req.body as VolunteerByPhoneNumberBody;

  try {
    const volunteer = await VolunteerModel.findOne({ phoneNumber });
    if (!volunteer) {
      return res.status(404).json({ error: "Could not find volunteer" });
    }
    res.status(200).json(volunteer);
  } catch (err) {
    next(err);
  }
};

export const getTagsAssignedToVolunteer: RequestHandler = async (req, res, next) => {
  const volunteerId = req.params.id;

  try {
    const volunteer = await VolunteerModel.findById(volunteerId);
    if (!volunteer) {
      return res.status(404).json({ error: "Could not find volunteer" });
    }
    res.status(200).json(volunteer.tags);
  } catch (err) {
    next(err);
  }
};

type CreateVolunteerBody = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  tags?: string[];
};

export const createVolunteer: RequestHandler = async (req, res, next) => {
  const errors = validationResult(req);
  const { firstName, lastName, email, phoneNumber, tags = [] } = req.body as CreateVolunteerBody;
  try {
    validationErrorParser(errors);

    const volunteer = await VolunteerModel.findOne({ email });
    if (volunteer) {
      return res.status(409).json({ error: "Volunteer with this email already exists" });
    }

    const newVolunteer = await VolunteerModel.create({
      firstName,
      lastName,
      email,
      phoneNumber,
      tags,
    });
    res.status(201).json(newVolunteer);
  } catch (err) {
    next(err);
  }
};

type UpdateVolunteerContactBody = {
  email: string;
  phoneNumber: string;
};

export const updateVolunteerContact: RequestHandler = async (req, res, next) => {
  const errors = validationResult(req);
  const volunteerId = req.params.id;
  const { email, phoneNumber } = req.body as UpdateVolunteerContactBody;

  try {
    validationErrorParser(errors);

    const volunteer = await VolunteerModel.findByIdAndUpdate(volunteerId, {
      phoneNumber,
      email,
    });

    if (!volunteer) {
      return res.status(404).json({ error: "Could not find volunteer" });
    }

    res.status(200).json(volunteer);
  } catch (err) {
    next(err);
  }
};

type AssignTagsBody = {
  tags: string[];
};

export const assignTagsToVolunteer: RequestHandler = async (req, res, next) => {
  const errors = validationResult(req);
  const volunteerId = req.params.id;

  try {
    validationErrorParser(errors);

    const { tags } = req.body as AssignTagsBody;
    const volunteer = await VolunteerModel.findByIdAndUpdate(volunteerId, {
      $addToSet: { tags: { $each: tags } },
    });

    if (!volunteer) {
      return res.status(404).json({ error: "Could not find volunteer" });
    }

    res.status(200).json(volunteer);
  } catch (err) {
    next(err);
  }
};

type RemoveTagsFromVolunteerBody = {
  tags: string[];
};

export const removeTagsFromVolunteer: RequestHandler = async (req, res, next) => {
  const errors = validationResult(req);
  const volunteerId = req.params.id;

  try {
    validationErrorParser(errors);

    const { tags } = req.body as RemoveTagsFromVolunteerBody;
    const volunteer = await VolunteerModel.findByIdAndUpdate(volunteerId, {
      $pullAll: { tags },
    });

    if (!volunteer) {
      return res.status(404).json({ error: "Could not find volunteer" });
    }

    res.status(200).json(volunteer);
  } catch (err) {
    next(err);
  }
};

export const deleteVolunteer: RequestHandler = async (req, res, next) => {
  const volunteerId = req.params.id;

  try {
    const volunteer = await VolunteerModel.findByIdAndDelete(volunteerId);
    if (!volunteer) {
      return res.status(404).json({ error: "Could not find volunteer" });
    }
    res.status(200).json({ message: "Volunteer deleted successfully" });
  } catch (err) {
    next(err);
  }
};

type CSVRawEntry = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  tagsUnparsed: string;
};

export const uploadVolunteersCsv: RequestHandler = async (req, res, next) => {
  try {
    if (req.file === undefined) {
      return res.status(400).json({ error: "No CSV file attached" });
    }

    const existingVolunteers = await VolunteerModel.find();
    const existingEmails = existingVolunteers.map((volunteer) => volunteer.email);

    const volunteerCreationBodies: CreateVolunteerBody[] = [] as CreateVolunteerBody[];
    const bufferStream = new PassThrough();
    bufferStream.end(req.file.buffer);


    await new Promise<void>((reject, resolve) =>  {
      bufferStream.pipe(csvParser())
        .on("data", (data: Record<string, string>) => {
          // console.log(data);
          if ((data as CSVRawEntry).email in existingEmails) {
            return;
          }

          const { tagsUnparsed, ...otherData } = data;
          const creationBody = {
            ...otherData,
            tags: tagsUnparsed.split(" "),
          } as CreateVolunteerBody;

          // console.log(creationBody);
          console.log("creationBody ", creationBody);
          console.log("rawData ", data as CSVRawEntry);
          volunteerCreationBodies.push(creationBody);
        })
        .on("end", resolve)
        .on("error", reject);
    });

    await Promise.all(
      volunteerCreationBodies.map(async (body) =>
        VolunteerModel.create({
          firstName: body.firstName,
          lastName: body.lastName,
          email: body.email,
          phoneNumber: body.phoneNumber,
          tags: body.tags,
        }),
      ),
    );

      // const result = await VolunteerModel.create(volunteerCreationBodies);
      // console.log(result);

      res.status(201).json({ message: "Volunteers created successfully" });
    });
  } catch (err) {
    next(err);
  }
};
