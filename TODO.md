# TODO: Phase 1 Enhancements - MFA, Real-Time Notifications, Advanced Reporting, File Uploads

## Phase 1A: Multi-Factor Authentication (MFA)
- [x] Install speakeasy dependency for TOTP
- [x] Update database schema to add MFA fields (mfa_secret, mfa_enabled) to users table
- [x] Create controllers/mfaController.js with setup and verify endpoints
- [x] Create routes/mfaRoutes.js for MFA endpoints
- [x] Update controllers/authController.js to integrate MFA in login flow
- [x] Update middleware/auth.js if needed for MFA verification
- [ ] Add MFA setup UI in settings.html
- [ ] Add MFA verification modal in login flow
- [ ] Update Page.html to include MFA components
- [x] Test MFA setup and login flow

## Phase 1B: Real-Time Notifications System
- [x] Install socket.io dependency
- [x] Create controllers/notificationsController.js for notification management
- [x] Create routes/notificationsRoutes.js
- [x] Update server.js to integrate Socket.io
- [x] Add notification preferences to users table (email_notifications, in_app_notifications)
- [x] Create utils/notifications.js for email and in-app notifications
- [x] Update backgroundTasks.js to handle notification sending
- [ ] Add notification UI components (notification dropdown, bell icon)
- [x] Update relevant controllers to emit notifications (ticket updates, biometric failures)
- [ ] Test real-time notifications and email notifications

## Phase 1C: Advanced Reporting & Analytics Dashboard
- [ ] Create controllers/reportsController.js with analytics endpoints
- [ ] Create routes/reportsRoutes.js
- [ ] Add database queries for user activity, ticket metrics, biometric analytics
- [ ] Create public/reports.html for reporting dashboard
- [ ] Add chart.js or similar for data visualization
- [ ] Implement PDF/CSV export functionality (install pdfkit and csv-writer)
- [ ] Update navigation to include reports section
- [ ] Add admin-only access to reports
- [ ] Test report generation and export

## Phase 1D: File Upload/Download in Vault
- [ ] Install multer for file handling
- [ ] Update vault_items table to add file_path, file_size, file_type fields
- [ ] Update controllers/vaultController.js to handle file uploads
- [ ] Add file validation (type, size limits) in utils/security.js
- [ ] Create uploads directory and secure file serving
- [ ] Update vault UI to support file uploads and downloads
- [ ] Add file preview for images/documents
- [ ] Update vault item creation/editing forms
- [ ] Test file upload, storage, and download functionality

## General Phase 1 Tasks
- [ ] Update package.json with all new dependencies
- [ ] Update .env with new environment variables (MFA secrets, notification settings, upload paths)
- [ ] Update VAULTDESK_PROJECT_DOCUMENTATION.md with new features
- [ ] Update README.md with new API endpoints and features
- [ ] Test all Phase 1 features integration
- [ ] Performance testing and optimization

## Dependencies
- Backend: speakeasy, socket.io, multer, pdfkit, csv-writer, chart.js (for frontend)
- Database: Schema updates for MFA, notifications, file storage
- Frontend: New HTML pages, modals, and components
- Security: File upload validation, secure file serving

## Notes
- Implement backend first, then frontend for each feature
- Ensure backward compatibility with existing features
- Add proper error handling and validation
- Follow existing code patterns and security practices
- Test thoroughly before moving to next phase
