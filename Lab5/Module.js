const module = {
    id: "M123",
    name: "Web Development Basics",
    description: "Learn fundamentals of web development using HTML, CSS, and JS.",
    course: "CS5610"
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