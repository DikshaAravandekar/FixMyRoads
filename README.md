# Damaged Roads Reporting App (MVP)

## What is included
- Backend: Node.js + Express + Mongoose (models, endpoints)
- Frontend: HTML/CSS/JS (report form + complaints list)
- Local image upload (saved to backend/uploads)
- Uses only topics taught in the course (HTML, CSS, JS, Node, Express, MongoDB)

## How to run
1. Start MongoDB locally or use Atlas and update backend/.env
2. Install backend deps:
   cd backend
   npm install
   npm run dev
3. Serve frontend (open index.html directly or run a simple static server):
   cd frontend
   python3 -m http.server 3000

## Notes
- Change MONGO_URI in backend/.env if using Atlas.
- Uploaded images are saved under backend/uploads (dev only).
