# 🚧 FixMyRoads
### Road Damage Reporting and Management System

FixMyRoads is a full-stack web application designed to help citizens report damaged roads, potholes, and other road-related issues. Users can submit complaints with photographs and location details, track the progress of their reports, and view complaints submitted by other citizens.

The application also provides an administrator dashboard to review complaints and update their status, helping improve transparency and road safety.

## ✨ Features

### 👤 Citizen Features
- **User Registration and Login:** Create an account and securely sign in.
- **Report Road Damage:** Submit complaints about potholes and damaged roads.
- **Photo Upload:** Attach photographs to provide visual evidence of road damage.
- **Location Details:** Enter an address and landmark for the reported issue.
- **Anonymous Reporting:** Option to submit complaints anonymously.
- **My Reports:** View submitted complaints and track their status.
- **Community Reports:** Browse complaints submitted by other citizens.
- **Complaint Tracking:** Check whether an issue is pending, in progress, or resolved.

### 🛡️ Administrator Features
- Administrator login
- View and review submitted complaints
- Inspect complaint photographs and location details
- Update complaint status
- Add remarks to complaints
- Search and filter complaints

## 🖥️ Screenshots

### 1. Home Page
![FixMyRoads Home Page](screenshots/01-homepage.png)

### 2. User Registration
![User Registration](screenshots/02-signup.png)

### 3. User Sign In
![User Sign In](screenshots/03-signin.png)

### 4. User Dashboard
![User Dashboard](screenshots/04-user-dashboard.png)

### 5. Report a Road Issue
![Report a Road Issue](screenshots/05-report-issue.png)

### 6. Photo Upload and Location Details
![Photo Upload and Location](screenshots/06-upload-photo-location.png)

### 7. My Reports
![My Reports](screenshots/07-my-reports.png)

### 8. Community Reports
![Community Reports](screenshots/08-community-reports.png)

### 9. Administrator Sign In
![Administrator Sign In](screenshots/09-admin-signin.png)

### 10. Administrator Dashboard
![Administrator Dashboard](screenshots/10-admin-dashboard.png)

## 🧰 Technologies Used

| Technology | Purpose |
|---|---|
| HTML5 | Web page structure |
| CSS3 | Styling and responsive layouts |
| JavaScript | Frontend interactions |
| Node.js | Backend runtime |
| Express.js | Backend routes and APIs |
| MongoDB | Database |
| Mongoose | MongoDB object modeling |
| Multer | Image upload handling |
| bcrypt | Password hashing |
| Express Session | Session management |
| Git and GitHub | Version control and project hosting |

## 📂 Project Structure

```text
damaged-roads-app/
├── .vscode/
├── backend/
│   ├── models/
│   │   ├── Complaint.js
│   │   └── User.js
│   ├── uploads/
│   ├── .env
│   ├── package.json
│   ├── package-lock.json
│   └── server.js
├── frontend/
│   ├── css/
│   │   └── styles.css
│   ├── images/
│   │   └── hero-road.png
│   ├── js/
│   │   ├── app.js
│   │   └── report.js
│   ├── shared/
│   │   └── nav.js
│   ├── admin-login.html
│   ├── admin.html
│   ├── complaint.html
│   ├── dashboard.html
│   ├── index.html
│   ├── login.html
│   ├── mycomplaints.html
│   ├── public.html
│   ├── report.html
│   └── signup.html
├── screenshots/
├── .gitignore
└── README.md
```

## ⚙️ Installation and Setup

### Prerequisites
- Node.js and npm
- MongoDB installed locally or a MongoDB Atlas account
- A web browser

### Step 1: Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd damaged-roads-app
```

Replace `YOUR_GITHUB_REPOSITORY_URL` with your actual GitHub repository URL.

### Step 2: Install Backend Dependencies

```bash
cd backend
npm install
```

### Step 3: Configure Environment Variables

Create a `.env` file inside the `backend` folder and configure the variables required by your application.

Example:

```env
PORT=5001
MONGODB_URI=your_mongodb_connection_string
SESSION_SECRET=your_secure_session_secret
```

Use the exact environment variable names expected by your `server.js` file. Never upload real database credentials or secrets to GitHub.

### Step 4: Start the Backend Server

From the `backend` directory, run:

```bash
node server.js
```

Open the local application URL configured in your project. For example:

```text
http://localhost:5001
```

The exact URL depends on your server configuration and how your frontend is served.

## 🔄 How It Works

1. A citizen registers or signs in to the application.
2. The citizen opens the report form and enters details about the road damage.
3. The citizen uploads a photograph and provides location details.
4. The complaint is stored in the database.
5. The administrator reviews the complaint and updates its status.
6. Citizens can view their reports and monitor progress.
7. Other citizens can browse community reports to stay informed about local road issues.

## 🎯 Project Objectives

- Simplify the process of reporting damaged roads.
- Encourage citizen participation in identifying road issues.
- Maintain a centralized record of road complaints.
- Enable administrators to manage and track complaints.
- Improve transparency in complaint management.
- Support safer roads and better civic infrastructure.

## 🚀 Future Enhancements

- Interactive map displaying reported road damage
- Automatic GPS location detection
- Email or SMS notifications for complaint updates
- Complaint upvoting and priority-based management
- Analytics dashboard for identifying areas with frequent road damage
- Integration with municipal complaint management systems

## 👩‍💻 Author

**Diksha Aravandekar**

B.Sc. Data Science and Business Intelligence

## 📄 License

This project was developed for educational and portfolio purposes.

