import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  // Получаем параметры из URL: ?access_token=XXX
  const searchParams = request.nextUrl.searchParams;
  const accessToken = searchParams.get('access_token');

  // Если нет токена, что-то пошло не так
  if (!accessToken) {
    return NextResponse.redirect(new URL('/?error=no_token', request.url));
  }

  try {
    // Этот код будет добавлен позже, когда настроим Strapi
    // Пока просто сохраняем токен в cookie
    const cookieStore = await cookies();
    
    cookieStore.set('access_token', accessToken, {
      maxAge: 60 * 60 * 24 * 7, // 1 неделя
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    // Редиректим на dashboard
    return NextResponse.redirect(new URL('/dashboard', request.url));
  } catch (error) {
    console.error('OAuth redirect error:', error);
    return NextResponse.redirect(new URL('/?error=auth_failed', request.url));
  }
}