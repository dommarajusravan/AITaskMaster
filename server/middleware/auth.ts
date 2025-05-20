import { Request, Response, NextFunction } from 'express';

// Middleware to check if user is authenticated
export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  
  res.status(401).json({ message: 'Not authenticated' });
}

// Middleware to check user permissions (optional for future use)
export function hasPermission(permission: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    // This is a simple implementation - in a real app, you'd check user permissions
    // For now we just pass through as all authenticated users have all permissions
    next();
  };
}
