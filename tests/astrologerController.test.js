import request from "supertest";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../app.js";
import Astrologer from "../models/astrologer.js";

let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    console.log(uri);
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(uri);
    }
});

afterEach(async () => {
    await Astrologer.deleteMany();
});

afterAll(async () => {
    await mongoose.connection.close();
    await mongoServer.stop();
});

describe("Astrologer API", () => {
    const astrologerData = [
        {
            name: "Astrologer A",
            rating: 5,
            preference: "neutral",
            currentLoad: 0,
            connectedUsers: [],
            hashedPassword: bcrypt.hashSync("Astrologer A@12345", 10),
        },
        {
            name: "Astrologer B",
            rating: 3,
            preference: "more",
            currentLoad: 1,
            connectedUsers: ["user1@example.com"],
            hashedPassword: bcrypt.hashSync("Astrologer B@12345", 10),
        },
    ];

    beforeEach(async () => {
        await Astrologer.insertMany(astrologerData);
    });

    //1. should allow high rated astrologer to update their preference
    test("Set preference: should allow valid astrologer to update preference", async () => {
        const astrologer = await Astrologer.findOne({ name: "Astrologer A" });

        const res = await request(app)
            .patch(`/astrologers/${astrologer._id}`)
            .send({
                preference: "more",
                password: "Astrologer A@12345",
            });

        expect(res.status).toBe(200);
        expect(res.body.astrologer.preference).toBe("more");
    });

    // 2. should not allow wrong password
    test("Set preference: should reject astrologer with invalid password", async () => {
        const astrologer = await Astrologer.findOne({ name: "Astrologer A" });

        const res = await request(app)
            .patch(`/astrologers/${astrologer._id}`)
            .send({
                preference: "less",
                password: "WrongPassword",
            });

        expect(res.status).toBe(401);
        expect(res.body.message).toBe("Invalid password");
    });

    // 3. should not allow low rated astrologers to change their rating
    test("Set preference: should reject astrologer with rating less than 4", async () => {
        const astrologer = await Astrologer.findOne({ name: "Astrologer B" });

        const res = await request(app)
            .patch(`/astrologers/${astrologer._id}`)
            .send({
                preference: "less",
                password: "Astrologer B@12345",
            });

        expect(res.status).toBe(403);
        expect(res.body.message).toBe("Your rating does not allow you to set preferences");
    });

    // 4. the connectUser controller should work as expected
    test("Connect user: should connect a user to the astrologer with the lowest load", async () => {
        const res = await request(app).post("/astrologers/connect").send({
            email: "user2@example.com",
        });

        expect(res.status).toBe(200);
        expect(res.body.astrologer.connectedUsers).toContain("user2@example.com");

        const updatedAstrologer = await Astrologer.findById(res.body.astrologer._id);
        expect(updatedAstrologer.currentLoad).toBe(1);
    });

    // 5. should hande the case when no astrologers are available -> so we delete the astrologers and then check
    test("Connect user: should handle no astrologers available", async () => {
        await Astrologer.deleteMany();

        const res = await request(app).post("/astrologers/connect").send({
            email: "user@example.com",
        });

        expect(res.status).toBe(404);
        expect(res.body.message).toBe("No astrologers available");
    });
});
