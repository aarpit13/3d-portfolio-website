/*
  Run from After Effects: File > Scripts > Run Script File...
  Creates Simple_Tree.aep next to this script.
*/
(function () {
    app.beginUndoGroup("Create Simple Tree");

    var project = app.newProject();
    var comp = project.items.addComp("Simple Tree", 1080, 1080, 1, 6, 30);
    comp.bgColor = [0.72, 0.90, 1.00];

    function solid(name, color, width, height, x, y) {
        var layer = comp.layers.addSolid(color, name, width, height, 1, comp.duration);
        layer.property("Transform").property("Position").setValue([x, y]);
        return layer;
    }

    function ellipse(name, color, size, x, y) {
        var layer = comp.layers.addShape();
        layer.name = name;
        var group = layer.property("Contents").addProperty("ADBE Vector Group");
        var shape = group.property("Contents").addProperty("ADBE Vector Shape - Ellipse");
        shape.property("Size").setValue([size, size]);
        var fill = group.property("Contents").addProperty("ADBE Vector Graphic - Fill");
        fill.property("Color").setValue(color);
        layer.property("Transform").property("Position").setValue([x, y]);
        return layer;
    }

    // Ground and trunk.
    solid("Ground", [0.37, 0.72, 0.32], 1080, 245, 540, 957.5);
    solid("Trunk", [0.35, 0.17, 0.07], 150, 420, 540, 710);

    // A soft, three-part leafy crown.
    ellipse("Leaves - Left", [0.08, 0.42, 0.18], 350, 390, 455);
    ellipse("Leaves - Right", [0.10, 0.50, 0.22], 350, 690, 455);
    ellipse("Leaves - Top", [0.12, 0.57, 0.25], 370, 540, 300);

    // Small highlight creates a little depth while keeping the tree simple.
    ellipse("Leaf Highlight", [0.26, 0.72, 0.34], 120, 475, 285);

    var scriptFile = new File($.fileName);
    var saveFile = new File(scriptFile.path + "/Simple_Tree.aep");
    project.save(saveFile);
    app.endUndoGroup();
})();
