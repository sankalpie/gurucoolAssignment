import Astrologer from "../models/astrologer.js";
import bcrypt from "bcrypt";

// Controller to set astrologer's preference
export const setPreference = async (req, res) => {
    try {
        const { preference, password } = req.body;
        //first we check if an astrologer with the ID exists or not
        const astrologer = await Astrologer.findById(req.params.id);
        if (!astrologer) return res.status(404).json({ message: "Astrologer not found" });
        //second, we check if password for that astrologer is a match or not
        const isPasswordMatch=await bcrypt.compare(password,astrologer.hashedPassword);
        if (!isPasswordMatch) {
            return res.status(401).json({ message: "Invalid password" });
        }
        //third, if the astrologer is found AND the password is also correct, only then we check if preference can be set or not
        if (astrologer.rating < 4) {
            return res.status(403).json({ message: "Your rating does not allow you to set preferences" });
        }
        astrologer.preference = preference;
        await astrologer.save();

        res.status(200).json({ message: "Preference updated successfully", astrologer });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

// Controller to connect a user to an astrologer
export const connectUser = async (req, res) => {
    try {
        const { email } = req.body;

        const astrologers = await Astrologer.aggregate([
            {
                $addFields: {
                    effectiveLoad: {
                        $switch: {
                            branches: [
                                { case: { $eq: ["$preference", "more"] }, then: { $multiply: ["$currentLoad", 0.5] } },
                                { case: { $eq: ["$preference", "less"] }, then: { $multiply: ["$currentLoad", 1.5] } }
                            ],
                            default: "$currentLoad"
                        }
                    }
                }
            },
            { $sort: { effectiveLoad: 1, rating: -1, name: 1 } }, // Sort by effectiveLoad (asc), then rating (desc), then name (asc)
            { $limit: 1 } // Only get the astrologer with the lowest effective load
        ]);

        if (astrologers.length === 0) {
            return res.status(404).json({ message: "No astrologers available" });
        }

        const selectedAstrologer = astrologers[0];

        const updatedAstrologer = await Astrologer.findByIdAndUpdate(
            selectedAstrologer._id,
            {
                $push: { connectedUsers: email },
                $inc: { currentLoad: 1 }
            },
            { new: true }
        );
        //resp
        res.status(200).json({
            message: `User connected to astrologer ${updatedAstrologer.name}`,
            astrologer: updatedAstrologer
        });

    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};
