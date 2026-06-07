import path from "node:path";

import express from "express";
import multer from "multer";

import * as volunteer from "../controllers/volunteerController";
import * as VolunteerValidator from "../validators/volunteerValidator";

import type { Multer } from "multer";

const allowedMimeTypes = ["text/csv", "application/csv", "application/vnd.ms-excel", "text/plain"];

const storage = multer.memoryStorage();
const upload: Multer = multer({
  storage,
  limits: { fileSize: 1024 * 1024 * 5 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (
      !allowedMimeTypes.includes(file.mimetype) ||
      path.extname(file.originalname).toLowerCase() !== ".csv"
    ) {
      return cb(new Error("Only CSV files are allowed"));
    }
    cb(null, true);
  },
});

const router = express.Router();

router.get("/:id", volunteer.getVolunteer);
router.get("/", volunteer.getVolunteers);
router.delete("/:id", volunteer.deleteVolunteer);

router.post("/", VolunteerValidator.createVolunteerValidator, volunteer.createVolunteer);
router.put("/:id", VolunteerValidator.updateVolunteerValidator, volunteer.updateVolunteer);
router.put(
  "/contact/:id",
  VolunteerValidator.updateVolunteerContactValidator,
  volunteer.updateVolunteerContact,
);

router.post("/parse-csv", upload.single("csv"), volunteer.parseVolunteersCsv);
router.post("/export-csv", volunteer.exportVolunteersCsv);

router.post(
  "/batch",
  VolunteerValidator.batchCreateVolunteerValidator,
  volunteer.uploadVolunteerBatch,
);

export default router;
