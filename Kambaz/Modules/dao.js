import Database from "../Database/index.js";
import { v4 as uuidv4 } from "uuid";

export function updateModule(moduleId, moduleUpdates) {
    const { modules } = Database;
    const module = modules.find((module) => module._id === moduleId);
    Object.assign(module, moduleUpdates);
    return module;
}

export function deleteModule(moduleId) {
    const { modules } = Database;
    Database.modules = modules.filter((module) => module._id !== moduleId);
}

export function createModule(module) {
    const newModule = { _id: uuidv4(), ...module };
    Database.modules = [...Database.modules, newModule];
    return newModule;
}

export function findModulesForCourse(courseId) {
    const { modules } = Database;
    return modules.filter((module) => module.course === courseId);
}

export function findModuleById(moduleId) {
    const { modules } = Database;
    return modules.find((module) => module._id === moduleId);
}