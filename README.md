# To-Do List Application

## Description
This is a simple To-Do List application for managing tasks. The app allows users to add, delete, and mark tasks as completed.

## Features ✨
- Add and delete tasks
- Mark tasks as completed or uncompleted
- Filter tasks by status (completed, uncompleted)

## Technologies Used 🛠️
- **Front-End:** HTML, CSS, JavaScript
- **Back-End:** Node.js, Express
- **Database:** PostgreSQL
- **Testing:** Mocha, Chai
- **CI/CD:** GitHub Actions

## API Endpoints

### Tasks
- `GET /tasks` – Get all tasks
- `GET /tasks?completed=true` – Get only completed tasks
- `GET /tasks?completed=false` – Get only uncompleted tasks
- `POST /tasks` – Create a new task
- `PUT /tasks/:id` – Update a task (mark task as completed or uncompleted)
- `DELETE /tasks/:id` – Delete a task

## How to Run 🚀
1. Clone this repository: `git clone https://github.com/lia-xyz/to-do-list-app.git`
2. Install dependencies: `npm install`
3. Setup environment variables. Create a `.env` file and add the following:
```
DB_HOST=your_host
DB_PORT=your_port
DB_USER=your_username
DB_PASSWORD=your_password
DB_DATABASE=your_database_name
```
4. Run the server: `npm start`
5. Open `index.html` in your browser.

## Running tests 🧪
The test environment uses Mocha and Chai to test API routes.  
Run the test: `npm test`

## CI/CD 🔄
This project uses GitHub Actions to run tests automatically on every push to the main branch.  
You can see the latest workflow runs here -> [View GitHub Actions Workflow](https://github.com/lia-xyz/to-do-list-app/actions)

## Contributing 🤝
Contributions, issues, and feature requests are welcome!  
Feel free to fork the repo and submit a pull request.

## License 📄
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.