import express from "express";
import {setPreference,connectUser} from "../controllers/astrologerController.js";

const router = express.Router();

// Route to update astrologers preference
router.patch("/:id", setPreference);

// Route to connect a user to an astrologer
router.post("/connect", connectUser);

export default router;