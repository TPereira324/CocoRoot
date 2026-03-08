# Copilot Instructions for Front-end MVC

This repository is a simple client-side MVC example written in vanilla JavaScript. There is no build step, no package manager, and the entire app runs by loading `index.html` in a browser.

## Architecture Overview

- **app.js**: Entry point executed after DOMContentLoaded. Instantiates `Model`, `View`, and `Controller` and calls `controller.init()`.
- **models/Model.js**: Holds in-memory user data and the login logic. The `login` method returns an object with `success` and optional `user` or `message`.
- **views/View.js**: Responsible for rendering HTML fragments into the `#app` element. Has helpers like `renderLogin()` and `displayMessage(message, isError)`.
- **controllers/Controller.js**: Coordinates model and view. Binds DOM events (`#login-form`) and handles user interactions (login submit). Shows messages returned by the model.
- **index.html**: Static HTML that includes the CSS and script files in the correct order (Model, View, Controller, then app.js).
- **style.css**: Base styles for layout, forms, buttons and message classes; uses Portuguese text for labels.

This is a classic MVC structure done entirely on the client side. There are no server calls or external dependencies.

## Developer Workflows

- **Running the app**: Open `index.html` in any modern browser (double-click, Live Server extension, etc.).
- **Debugging**: Use browser devtools to set breakpoints in any of the JS files. There is no transpilation, so line numbers match.
- **Adding features**: New views should update `View.js`, and corresponding controller methods should be implemented in `Controller.js`. Models stay in `Model.js`.

There is no build or test command configured; simply editing the JS files and refreshing the page exercises changes.

## Project-Specific Conventions

- All files are plain ES5/ES6 modules (no `export`/`import`), loaded via `<script>` tags.
- IDs in the DOM (`#app`, `#login-form`, `#login-message`) are referenced directly; keep them unique.
- Messages and labels are written in Brazilian Portuguese. When introducing new user-facing text, maintain the language consistency.
- The controller method names follow `handleX` pattern (e.g., `handleLogin`). Event binding occurs inside `bindEvents()` invoked during `init()`.
- Model methods return simple objects indicating success/failure; controllers interpret these and call view helpers.

## Extending the Codebase

- **New pages**: Add new renderer methods in `View` (e.g., `renderHome`, `renderError`). Call them from controller based on model state.
- **Persistent data**: If you need persistence, modify `Model` to use `localStorage` or an API. Keep `Model` methods synchronous for now.
- **Styling**: Add CSS rules in `style.css`, following existing naming patterns (`.login-container`, `.input-group`, `.message`, etc.).

## Miscellaneous Notes

- The `login` logic currently uses hard‑coded user credentials. For any authentication work, adjust the `users` array or replace with API calls.
- The app does not use any framework or third-party libraries; avoid introducing them unless requirements change.
- When editing files, preserve the script inclusion order in `index.html`: Model before View before Controller, as controllers rely on constructors defined earlier.

> **Note for AI agents**: do not add generic packages or scaffolding. Changes should respect the minimalist, static nature of the project.

---

If any part of this summary is unclear, or if the project evolves, please ask for updates.