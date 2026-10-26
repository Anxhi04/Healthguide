# Local profile photos

Profile photos use the existing authenticated `PUT /users/me/photo` endpoint with a raw JPEG, PNG or WebP body (maximum 5 MB). Clients send `Content-Type` and `X-Photo-Filename`; the optional filename is checked for a matching extension and is never used as the stored filename. The server also checks the image signature. `DELETE /users/me/photo` removes the reference and the previous local image.

Files are created automatically in `backend/uploads/profile-photos/`, independent of the process working directory. Filenames contain a SHA-256 owner identifier, a random UUID and a server-selected extension. Express serves this directory at `/uploads/profile-photos/`.

The existing `users/{uid}.photoUrl` field stores an absolute URL. The existing `photoStoragePath` field stores the local public path for safe cleanup. No image bytes or base64 are stored in Firestore. The authenticated token supplies the owner; upload requests do not accept a user ID.

Set `PUBLIC_BACKEND_URL=https://your-backend.example` in `backend/.env` when using a reverse proxy or public deployment. Otherwise the URL uses the upload request's protocol and host, so mobile uploads use the same reachable backend host as the mobile API. Web and mobile render the returned absolute URL directly. The configured host must be reachable by both clients. Keep this URL stable because it is persisted in profiles.

Replacement writes the new file, commits the profile transaction, then deletes the old local file. A failed profile transaction removes the newly uploaded file and preserves the old reference/file. Cleanup only accepts generated local files belonging to the same owner. Previous Firebase URLs continue to display until replaced, but this service does not upload to or delete from Firebase Storage. Community covers now use the same local-filesystem mechanism in `backend/uploads/community-images/`; see `final-refactor.md`. Existing remote URLs in historical Firestore documents must be replaced by uploading the original images again.

Mobile retains Change photo → preview → Save photo, with Cancel discarding only the selection. Web retains its existing profile upload UI and sends files to the same endpoint. No new dependencies are needed.

Persist and back up the uploads directory alongside the database for server deployments. Multiple backend instances need a shared persistent directory.

Verification: `npm run build`, `node src/scripts/profilePhoto.test.cjs`, `npm run test:privacy` from backend; `npm run build` from web.
