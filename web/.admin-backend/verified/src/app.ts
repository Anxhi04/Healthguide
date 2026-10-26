import express from "express";
import cors from "cors";

const app = express();

import userRoutes from "./routes/user.routes";
import hospitalRoutes from "./routes/hospital.routes";
import specilityRoutes from "./routes/speciality.routes";
import serviceRoutes from "./routes/service.routes";
import doctorRoutes from "./routes/doctor.routes";
import doctorSpecialityRoutes from "./routes/doctorSpeciality.routes";
import doctorAssignmentRoutes from "./routes/doctorAssignment.routes";
import hospitalSpecialityRoutes from "./routes/hospitalSpeciality.routes";
import hospitalServiceRoutes from "./routes/hospitalService.routes";
import reviewRoutes from "./routes/review.routes";
import postsRoutes from "./routes/posts.routes";
import commentsRoutes from "./routes/comments.routes";
import communityRoutes from "./routes/community.routes";
import communityMembersRoutes from "./routes/communityMembers.routes";
import reportsRouter from "./routes/reports.routes";
import notificationRoutes from "./routes/notification.routes";
import bannedWordsRouter from "./routes/bannedWords.routes";

// Middlewares

app.use(cors());
app.use(express.json());

// Test Route
app.get("/", (_req, res) => {
  res.send("HealthConnect API is running 🚀");
});

app.use("/users", userRoutes)
app.use("/hospital", hospitalRoutes);
app.use("/speciality", specilityRoutes);
app.use("/service", serviceRoutes);
app.use("/doctor", doctorRoutes);
app.use("/doctor-speciality", doctorSpecialityRoutes);
app.use("/doctor-assignment", doctorAssignmentRoutes);
app.use("/doctor-speciality", doctorSpecialityRoutes);
app.use("/hospital-speciality", hospitalSpecialityRoutes);
app.use("/hospital-service", hospitalServiceRoutes);
app.use("/review", reviewRoutes);
app.use("/post", postsRoutes);
app.use("/comments", commentsRoutes);
app.use("/community", communityRoutes);
app.use("/community-members", communityMembersRoutes);
app.use("/report", reportsRouter);
app.use("/notification", notificationRoutes);
app.use("/banned-words", bannedWordsRouter);

export default app;