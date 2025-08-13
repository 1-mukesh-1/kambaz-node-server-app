import model from "./model.js";
import { v4 as uuidv4 } from "uuid";

export async function createUser(user) {
    try {
        const newUser = { ...user, _id: uuidv4() };
        return await model.create(newUser);
    } catch (error) {
        if (error.code === 11000) {
            throw new Error("Username already exists");
        }
        throw new Error(`Failed to create user: ${error.message}`);
    }
}

export async function findUserByUsername(username) {
    try {
        return await model.findOne({ username: username });
    } catch (error) {
        throw new Error(`Failed to find user by username: ${error.message}`);
    }
}

export async function findAllUsers() {
    try {
        return await model.find();
    } catch (error) {
        throw new Error(`Failed to find users: ${error.message}`);
    }
}

export async function findUserById(userId) {
    try {
        return await model.findById(userId);
    } catch (error) {
        throw new Error(`Failed to find user ${userId}: ${error.message}`);
    }
}

export async function findUserByCredentials(username, password) {
    try {
        return await model.findOne({ username, password });
    } catch (error) {
        throw new Error(`Failed to find user by credentials: ${error.message}`);
    }
}

export async function updateUser(userId, user) {
    try {
        return await model.updateOne({ _id: userId }, { $set: user });
    } catch (error) {
        throw new Error(`Failed to update user ${userId}: ${error.message}`);
    }
}

export async function deleteUser(userId) {
    try {
        return await model.deleteOne({ _id: userId });
    } catch (error) {
        throw new Error(`Failed to delete user ${userId}: ${error.message}`);
    }
}

export async function findUsersByRole(role) {
    try {
        return await model.find({ role: role });
    } catch (error) {
        throw new Error(`Failed to find users by role ${role}: ${error.message}`);
    }
}

export async function findUsersByPartialName(partialName) {
    try {
        const regex = new RegExp(partialName, "i");
        return await model.find({
            $or: [{ firstName: { $regex: regex } }, { lastName: { $regex: regex } }],
        });
    } catch (error) {
        throw new Error(`Failed to find users by name ${partialName}: ${error.message}`);
    }
}