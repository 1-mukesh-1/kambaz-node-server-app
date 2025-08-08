const module = {
    id: "0000",
    name: "web dev course",
    description: "test desc",
    course: "HG54"
};

export default function Module(app) {
    app.get("/lab5/module", (req, res) => {
        res.json(module);
    });

    app.get("/lab5/module/name", (req, res) => {
        res.send(module.name);
    });

    app.get("/lab5/module/name/:name", (req, res) => {
        const { name } = req.params;
        module.name = name;
        res.json(module);
    });

    app.get("/lab5/module/description/:description", (req, res) => {
        const { description } = req.params;
        module.description = description;
        res.json(module);
    });
}