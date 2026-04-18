import prisma from './prisma.js';

export const logActivity = async (userId: number, action: string, details?: any, ipAddress?: string) => {
  try {
    await prisma.activityLog.create({
      data: {
        userId,
        action,
        details: details ? JSON.stringify(details) : null,
        ipAddress,
      },
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
};
