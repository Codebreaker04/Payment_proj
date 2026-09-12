import { NextRequest, NextResponse } from 'next/server';
import { SignupRequestSchema, SignupResponseSchema } from '@repo/contracts';

const API_BASE_URL =
  process.env.API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  'http://localhost:3002';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate against the shared contract
    const request = SignupRequestSchema.safeParse(body);
    if (!request.success) {
      const message = request.error.issues[0]?.message ?? 'Invalid input';
      return NextResponse.json({ success: false, message }, { status: 400 });
    }

    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request.data),
      cache: 'no-store',
    });

    const data = (await response.json().catch(() => null)) as unknown;

    // One envelope for success and failure — parse it once.
    const result = SignupResponseSchema.safeParse(data);
    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: response.ok
            ? 'Authentication service returned an invalid response'
            : 'Unable to reach the authentication service',
        },
        { status: response.ok ? 502 : 503 },
      );
    }

    if (!result.data.success) {
      return NextResponse.json(
        { success: false, message: result.data.message },
        { status: response.status },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: result.data.message,
        user: {
          id: result.data.user.id,
          email: result.data.user.email,
          name: result.data.user.name,
        },
      },
      { status: 201 },
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Failed to create account';
    console.error('Signup error:', error);
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}