export enum Gender {
    FEMALE= "FEMALE",
    MALE="MALE",
    PREFER_NOT_TO_SAY="PREFER_NOT_TO_SAY",
    OTHER="OTHER"
}

export enum Role{
    USER="USER",
    ADMIN="ADMIN",
    HOSPITAL_ADMIN="HOSPITAL_ADMIN",
}
export enum TargetType{
  HOSPITAL="HOSPITAL",
  DOCTOR="DOCTOR"
}

export enum UserStatus {
    ACTIVE="ACTIVE",
    BLOCKED="BLOCKED",
}

export enum DisplayMode {
    REAL="REAL",
    ANONYMOUS="ANONYMOUS"
}
export enum PostType{
    EXPERIENCE = "EXPERIENCE",
    HELP_REQUEST = "HELP_REQUEST",
    OPINION_REQUEST = "OPINION_REQUEST",
}
export enum ReportTargetType {
  POST = "POST",
  COMMENT = "COMMENT",
  REVIEW = "REVIEW",
  USER = "USER",
}
export enum ReportReason {
  INAPPROPRIATE_CONTENT = "INAPPROPRIATE_CONTENT",
  HARASSMENT = "HARASSMENT",
  SPAM = "SPAM",
  MISLEADING_INFORMATION = "MISLEADING_INFORMATION",
  OFFENSIVE_LANGUAGE = "OFFENSIVE_LANGUAGE",
  OTHER = "OTHER",
}
export enum ReportStatus {
  PENDING = "PENDING",
  RESOLVED = "RESOLVED",
  REJECTED = "REJECTED",
}
export enum ReviewStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}
export enum HospitalType {
  PUBLIC = "PUBLIC",
  PRIVATE = "PRIVATE",
}

export enum HospitalStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  SUSPENDED = "SUSPENDED",
}

