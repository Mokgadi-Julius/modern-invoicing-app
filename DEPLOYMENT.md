# Production Deployment Guide

This guide covers deploying the InvoiceWriteNow application to production using Firebase.

## Prerequisites

- Node.js 18+ installed
- Firebase CLI installed (`npm install -g firebase-tools`)
- Firebase project created
- Domain configured (optional)

## Pre-Deployment Checklist

### 1. Environment Configuration

1. Copy environment files:
   ```bash
   cp .env.example .env.local
   cp .env.production.example .env.production
   ```

2. Configure production environment variables:
   - Firebase project credentials
   - Secure admin setup key
   - Enable production features
   - Configure external services (Sentry, Analytics)

### 2. Firebase Project Setup

1. **Create Firebase Project**:
   ```bash
   firebase login
   firebase projects:create your-project-id
   firebase use your-project-id
   ```

2. **Enable Required Services**:
   - Authentication (Email/Password)
   - Firestore Database
   - Firebase Storage
   - Firebase Hosting

3. **Configure Authentication**:
   - Enable Email/Password sign-in method
   - Set up authorized domains for production

### 3. Security Configuration

1. **Deploy Security Rules**:
   ```bash
   firebase deploy --only firestore:rules
   firebase deploy --only storage:rules
   ```

2. **Verify Rules**:
   - Test user isolation
   - Verify admin permissions
   - Check data access controls

3. **Deploy Indexes**:
   ```bash
   firebase deploy --only firestore:indexes
   ```

## Deployment Process

### 1. Build Application

```bash
# Install dependencies
npm install

# Run tests (if available)
npm run test

# Type checking
npm run type-check

# Lint code
npm run lint

# Build for production
npm run build
```

### 2. Deploy to Firebase

```bash
# Deploy everything
firebase deploy

# Or deploy specific services
firebase deploy --only hosting
firebase deploy --only firestore
firebase deploy --only storage
```

### 3. Post-Deployment Verification

1. **Verify Application**:
   - Test user registration
   - Test admin approval workflow
   - Test core invoice functionality
   - Verify offline support

2. **Performance Check**:
   - Run Lighthouse audit
   - Check loading times
   - Verify caching headers

3. **Security Verification**:
   - Test unauthorized access
   - Verify data isolation
   - Check admin-only features

## Environment-Specific Configuration

### Production Settings

```bash
# .env.production
VITE_APP_ENVIRONMENT=production
VITE_DEBUG_MODE=false
VITE_LOG_LEVEL=error
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_ERROR_REPORTING=true
```

### Staging Settings

```bash
# .env.staging
VITE_APP_ENVIRONMENT=staging
VITE_DEBUG_MODE=true
VITE_LOG_LEVEL=warn
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_ERROR_REPORTING=true
```

## Monitoring and Maintenance

### 1. Error Monitoring

- **Sentry Integration**: Configure for production error tracking
- **Console Monitoring**: Monitor Firebase Console for errors
- **User Feedback**: Set up user feedback collection

### 2. Performance Monitoring

- **Firebase Performance**: Enable performance monitoring
- **Web Vitals**: Monitor Core Web Vitals
- **Database Performance**: Monitor Firestore query performance

### 3. Security Monitoring

- **Firebase Security**: Monitor security rule violations
- **Authentication**: Monitor failed login attempts
- **Data Access**: Monitor unusual data access patterns

## Scaling Considerations

### 1. Database Optimization

- **Indexes**: Ensure proper indexes for all queries
- **Denormalization**: Consider data denormalization for read-heavy operations
- **Batch Operations**: Use batch writes for bulk operations

### 2. Storage Optimization

- **Image Compression**: Implement client-side image compression
- **File Cleanup**: Set up automatic cleanup of unused files
- **CDN**: Leverage Firebase's global CDN

### 3. Performance Optimization

- **Code Splitting**: Implement dynamic imports
- **Lazy Loading**: Load components on demand
- **Service Worker**: Implement for offline functionality

## Backup and Recovery

### 1. Database Backup

```bash
# Export Firestore data
gcloud firestore export gs://your-backup-bucket/backups/$(date +%Y%m%d)
```

### 2. Configuration Backup

- Export Firebase configuration
- Backup security rules
- Document environment variables

### 3. Recovery Plan

- Database restoration process
- Configuration restoration
- User communication plan

## CI/CD Pipeline

### GitHub Actions Example

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          projectId: your-project-id
```

## Troubleshooting

### Common Issues

1. **Environment Variables Not Loading**:
   - Verify file names (.env.production, not .env.prod)
   - Check VITE_ prefix on all variables
   - Ensure build process includes environment

2. **Security Rules Failing**:
   - Test rules in Firebase Console
   - Verify user authentication state
   - Check document structure matches rules

3. **Slow Loading**:
   - Check network waterfall
   - Optimize bundle size
   - Verify caching headers

4. **Offline Issues**:
   - Test service worker registration
   - Check offline storage limits
   - Verify sync functionality

### Support Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)

## Security Best Practices

1. **Environment Security**:
   - Never commit .env files
   - Use different Firebase projects for dev/prod
   - Rotate admin setup keys regularly

2. **Database Security**:
   - Regular security rule audits
   - Monitor for rule violations
   - Implement data validation

3. **Application Security**:
   - Regular dependency updates
   - Security vulnerability scanning
   - Input validation and sanitization

## Performance Targets

- **First Contentful Paint**: < 2.5s
- **Largest Contentful Paint**: < 4.0s
- **Cumulative Layout Shift**: < 0.1
- **Time to Interactive**: < 5.0s
- **Bundle Size**: < 500KB (gzipped)

## Support and Maintenance

### Regular Tasks

- Weekly dependency updates
- Monthly security rule review
- Quarterly performance audit
- Annual backup testing

### Monitoring Alerts

- Error rate > 1%
- Response time > 5s
- Offline sync failures
- Authentication failures

---

For additional support, refer to the main README.md or contact the development team.