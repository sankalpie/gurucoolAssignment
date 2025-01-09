import express from "express";
import {setPreference,connectUser} from "../controllers/astrologerController.js";

const router = express.Router();

router.get("/",(req,resp)=>{
    resp.status(200).json("Astrologer Connect Backend")
});

// Route to update astrologers preference
router.patch("/:id", setPreference);

// Route to connect a user to an astrologer
router.post("/connect", connectUser);

export default router;