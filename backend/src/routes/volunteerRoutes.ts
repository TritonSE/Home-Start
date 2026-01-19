import express from "express";

import * as volunteer from "../controllers/volunteerController";
import * as VolunteerValidator from "../validators/volunteerValidator";

const router = express.Router();

router.get("/:id", volunteer.getVolunteer);
router.get("/", volunteer.getVolunteers);
router.delete("/:id", volunteer.deleteVolunteer);

router.post("/", VolunteerValidator.createVolunteerValidator, volunteer.createVolunteer);
router.put(
  "/contact/:id",
  VolunteerValidator.updateVolunteerContactValidator,
  volunteer.updateVolunteerContact,
);
router.put(
  "/tags/:id",
  VolunteerValidator.assignVolunteerTagsValidator,
  volunteer.assignTagsToVolunteer,
);
export default router;
