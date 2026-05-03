import express from "express";

import * as volunteerAssignment from "../controllers/volunteerAssignmentController";

const router = express.Router();

router.get("/", volunteerAssignment.getVolunteerAssignments);
router.get("/:volunteerId", volunteerAssignment.getVolunteerAssignmentsByVolunteerId);
router.post("/", volunteerAssignment.createVolunteerAssignment);
router.put("/:id", volunteerAssignment.updateVolunteerAssignment);
router.delete("/:id", volunteerAssignment.deleteVolunteerAssignment);

export default router;
