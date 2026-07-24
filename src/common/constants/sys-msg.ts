export const SYS_MSG = {
  REQ_CYCLE: {
    SUCCESS: 'Request completed successfully',
    RETRIEVED: 'Resource retrieved successfully',
    CREATED: 'Resource created successfully',
    UPDATED: 'Resource updated successfully',
    DELETED: 'Resource deleted successfully',
    ACCEPTED: 'Request accepted for asynchronous processing',
    NO_CONTENT: 'Request completed successfully with no response body',
    BAD_REQUEST: 'The request could not be processed because it is invalid',
    UNAUTHORIZED: 'Authentication is required or has failed',
    FORBIDDEN: 'You do not have permission to access this resource',
    NOT_FOUND: 'The requested resource was not found',
    CONFLICT: 'The request conflicts with the current resource state',
    VALIDATION_FAILED: 'Request validation failed',
    INTERNAL_SERVER_ERROR: 'An unexpected server error occurred',
  },
  AUTH: {
    INVALID_SESSION_ID: 'Invalid session id',
    SESSION_EXPIRED: 'The requested session has expired. Login again'
  }
};
