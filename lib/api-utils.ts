import { NextRequest, NextResponse } from 'next/server';

export class ApiError extends Error {
  constructor(
    public message: string,
    public status: number = 500
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function withErrorHandler<T extends any[], R>(
  handler: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R | NextResponse> => {
    try {
      return await handler(...args);
    } catch (error) {
      console.error('API Error:', error);
      
      if (error instanceof ApiError) {
        return NextResponse.json(
          { error: error.message },
          { status: error.status }
        );
      }
      
      if (error instanceof Error) {
        return NextResponse.json(
          { error: error.message || 'Internal server error' },
          { status: 500 }
        );
      }
      
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}

export function createApiRoute(
  handler: (req: NextRequest, context?: any) => Promise<NextResponse>
) {
  return withErrorHandler(handler);
}