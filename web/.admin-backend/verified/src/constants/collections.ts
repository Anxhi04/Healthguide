//here we will be saving our collections name in order to access from here 
//if we change the name of one collecteion in the future it will be needed to change only here not somewhere else 

export const COLLECTIONS = {
    // Main collections
    USERS: "users",
    HOSPITALS: "hospitals",
    DOCTOR: "doctors",
    SPECIALITIES: "specialities",
    SERVICES: "services",

    REVIEWS: "reviews",

    POSTS: "posts",
    COMMENTS: "comments",

    COMMUNITIES: "communities",
    COMMUNITY_MEMBERS: "communityMembers",

    NOTIFICATIONS: "notifications",

    REPORTS: "reports",
    BANNED_WORDS: "bannedWords",


    // Relationship collections
    DOCTOR_ASSIGNMENTS: "doctorAssignments",
    DOCTOR_SPECIALITIES: "doctorSpecialities",
    HOSPITAL_SPECIALITIES: "hospitalSpecialities",
    HOSPITAL_SERVICES: "hospitalServices",
};
