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






app.get("/api/debug/modules-detailed", async (req, res) => {
    try {
        // Check if any modules exist at all
        const allModules = await model.find({}).limit(10);
        
        // Also check by searching for any modules with course "RS101"
        const rs101Modules = await model.find({ course: "RS101" });
        
        res.json({
            totalModulesInDB: allModules.length,
            allModules: allModules,
            rs101Modules: rs101Modules,
            sampleModuleIds: allModules.map(m => ({ id: m._id, name: m.name }))
        });
    } catch (error) {
        res.json({ error: error.message, stack: error.stack });
    }
});

app.get("/api/debug/modules", async (req, res) => {
    try {
        // Use your existing DAO functions
        const rs101Modules = await modulesDao.findModulesForCourse("RS101");
        const specificModule = await modulesDao.findModuleById("M101");
        
        res.json({
            rs101ModuleCount: rs101Modules.length,
            rs101ModuleIds: rs101Modules.map(m => m._id),
            M101Found: !!specificModule,
            M101Data: specificModule,
            searchAttempt: "M101"
        });
    } catch (error) {
        res.json({ error: error.message, stack: error.stack });
    }
});
}