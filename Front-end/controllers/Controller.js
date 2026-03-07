class Controller {
    constructor(model, view) {
        this.model = model;
        this.view = view;
    }

    init() {
        const data = this.model.getData();
        this.view.render(data);
    }
}