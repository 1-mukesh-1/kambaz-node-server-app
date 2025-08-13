import * as modulesDao from "./dao.js";

export default function ModuleRoutes(app) {
    app.put("/api/modules/:moduleId", async (req, res) => {
        const { moduleId } = req.params;
        const moduleUpdates = req.body;
        await modulesDao.updateModule(moduleId, moduleUpdates);
        const updatedModule = await modulesDao.findModuleById(moduleId);
        res.json(updatedModule);
    });

    app.delete("/api/modules/:moduleId", async (req, res) => {
        const { moduleId } = req.params;
        const status = await modulesDao.deleteModule(moduleId);
        res.send(status);
    });

    app.get("/api/modules/:moduleId", async (req, res) => {
        const { moduleId } = req.params;
        const module = await modulesDao.findModuleById(moduleId);
        if (module) {
            res.json(module);
        } else {
            res.status(404).send("Module not found");
        }
    });
}