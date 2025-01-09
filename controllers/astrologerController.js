import Astrologer from "../models/astrologer.js";

// Controller to set astrologer's preference
export const setPreference = async (req, res) => {
    try {
        const { preference } = req.body;
        const astrologer = await Astrologer.findById(req.params.id);

        if (!astrologer) return res.status(404).json({ message: "Astrologer not found" });

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

        const astrologers = await Astrologer.find();

        if (astrologers.length === 0) {
            return res.status(404).json({ message: "No astrologers available" });
        }

        // Adjust load based on preferences
        astrologers.forEach(astrologer => {
            if (astrologer.preference === "more") {
                astrologer.effectiveLoad = astrologer.currentLoad * 0.5;
            } else if (astrologer.preference === "less") {
                astrologer.effectiveLoad = astrologer.currentLoad * 1.5;
            } else {
                astrologer.effectiveLoad = astrologer.currentLoad;
            }
        });

        // Find the astrologer with the lowest effective load
        astrologers.sort((a, b) => {
            if (a.effectiveLoad !== b.effectiveLoad) {
                return a.effectiveLoad - b.effectiveLoad; // Primary sort by effectiveLoad
            }
            if (b.rating !== a.rating) {
                return b.rating - a.rating; // Secondary sort by rating (desc)
            }
            return a.name.localeCompare(b.name); // Tertiary sort alphabetically by name
        });
        const selectedAstrologer = astrologers[0];

        // push the user email into the connectedUsers array then increase the currentLoad
        selectedAstrologer.connectedUsers.push(email);
        selectedAstrologer.currentLoad++;

        await selectedAstrologer.save();

        res.status(200).json({
            message: `User connected to astrologer ${selectedAstrologer.name}`,
            astrologer: selectedAstrologer
        });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};
