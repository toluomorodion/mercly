import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import type { ApiResponse } from '@/types';

export async function GET(req: NextRequest) {
  try {
    const txRef = req.nextUrl.searchParams.get('txRef');
    
    if (!txRef) {
      return NextResponse.json<ApiResponse>(
        { ok: false, error: { code: 'invalid_input', message: 'Transaction reference is required' } },
        { status: 400 }
      );
    }

    const order = await db.order.findUnique({
      where: { transactionReference: txRef },
      select: { status: true }
    });

    if (!order) {
      return NextResponse.json<ApiResponse>(
        { ok: false, error: { code: 'not_found', message: 'Order not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse<{ status: string }>>({ 
      ok: true, 
      data: { status: order.status } 
    });
  } catch (error) {
    console.error(`api.orders.status.failed`, error);
    return NextResponse.json<ApiResponse>(
      { ok: false, error: { code: 'server_error', message: 'Something went wrong' } },
      { status: 500 }
    );
  }
}
