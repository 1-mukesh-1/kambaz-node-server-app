import * as assignmentsDao from "../Assignments/dao.js";

export default function AssignmentRoutes(app) {
    app.get("/api/assignments", async (req, res) => {
        const assignments = await assignmentsDao.findAllAssignments();
        res.json(assignments);
    });

    app.get("/api/assignments/:assignmentId", async (req, res) => {
        const { assignmentId } = req.params;
        const assignment = await assignmentsDao.findAssignmentById(assignmentId);
        if (assignment) {
            res.json(assignment);
        } else {
            res.status(404).send("Assignment not found");
        }
    });

    app.post("/api/assignments", async (req, res) => {
        const newAssignment = req.body;
        const createdAssignment = await assignmentsDao.createAssignment(newAssignment);
        res.status(201).json(createdAssignment);
    });

    app.put("/api/assignments/:assignmentId", async (req, res) => {
        const { assignmentId } = req.params;
        const updates = req.body;
        const updatedAssignment = await assignmentsDao.updateAssignment(assignmentId, updates);
        res.json(updatedAssignment);
    });

    app.delete("/api/assignments/:assignmentId", async (req, res) => {
        const { assignmentId } = req.params;
        await assignmentsDao.deleteAssignment(assignmentId);
        res.sendStatus(204);
    });
}