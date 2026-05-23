import { cookies } from 'next/headers';
import * as jwt from 'jsonwebtoken';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { JWT_SECRET } from '@/lib/utils/auth';
import { LayoutGrid, Users, BarChart2, ArrowRight } from 'lucide-react';

export default async function MarketingHomePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;
  let isAuthenticated = false;

  if (token) {
    try {
      jwt.verify(token, JWT_SECRET);
      isAuthenticated = true;
    } catch {
      // Invalid token: keep showing the public landing page.
    }
  }

  return (
    <main className="space-y-gap-xl pb-gap-xl">
      {isAuthenticated ? (
        <section className="bg-primary/10 px-gap-md py-gap-sm">
          <div className="mx-auto flex max-w-6xl flex-col gap-gap-sm rounded-sm bg-surface-2 p-gap-md text-center md:flex-row md:items-center md:justify-between md:text-left">
            <div>
              <p className="text-label-sm font-semibold uppercase tracking-wide text-primary">
                Welcome back
              </p>
              <p className="text-body text-ink-muted">
                Your dashboard is ready. Jump straight into your workspaces.
              </p>
            </div>
            <Button asChild variant="default" size="lg">
              <Link href="/workspaces">
                Go to workspaces
                <ArrowRight className="ml-gap-sm h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      ) : null}

      {/* Hero Section */}
      <section className="bg-surface-1 px-gap-md py-gap-xl">
        <div className="mx-auto max-w-4xl space-y-gap-md text-center">
          <h1 className="text-5xl font-heading font-bold text-ink leading-tight">
            Treclone — Tổ chức công việc, hoàn thành mục tiêu
          </h1>
          <p className="text-title-md text-ink-muted max-w-2xl mx-auto">
            Quản lý dự án, sắp xếp nhiệm vụ và cộng tác cùng đội ngũ — mọi thứ
            bạn cần để làm việc hiệu quả đều ở một chỗ.
          </p>
          <div className="flex gap-gap-md justify-center pt-gap-md">
            <Link href="/register">
              <Button variant="default">Bắt đầu miễn phí</Button>
            </Link>
            <Link href="/login">
              <Button variant="outline">Đăng nhập</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-canvas px-gap-md py-gap-xl">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-headline-lg font-heading text-ink text-center mb-gap-xl">
            Tính năng chính
          </h2>
          <div className="grid md:grid-cols-3 gap-gap-lg">
            <div className="bg-surface-2 rounded-sm p-gap-md space-y-gap-sm">
              <div className="w-12 h-12 bg-primary/10 rounded-sm flex items-center justify-center">
                <LayoutGrid className="h-6 w-6 text-primary" />
              </div>{' '}
              <h3 className="text-title-md font-heading text-ink">
                Quản lý trực quan{' '}
              </h3>
              <p className="text-body text-ink-muted">
                Kéo thả thẻ, sắp xếp danh sách và theo dõi tiến độ công việc một
                cách trực quan, dễ nắm bắt.{' '}
              </p>
            </div>
            <div className="bg-surface-2 rounded-sm p-gap-md space-y-gap-sm">
              <div className="w-12 h-12 bg-primary/10 rounded-sm flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>{' '}
              <h3 className="text-title-md font-heading text-ink">
                Cộng tác nhóm
              </h3>
              <p className="text-body text-ink-muted">
                Chia sẻ bảng, giao nhiệm vụ và trao đổi với đồng đội để đẩy
                nhanh tiến độ.
              </p>
            </div>
            <div className="bg-surface-2 rounded-sm p-gap-md space-y-gap-sm">
              <div className="w-12 h-12 bg-primary/10 rounded-sm flex items-center justify-center">
                <BarChart2 className="h-6 w-6 text-primary" />
              </div>{' '}
              <h3 className="text-title-md font-heading text-ink">
                Theo dõi và báo cáo{' '}
              </h3>
              <p className="text-body text-ink-muted">
                Theo dõi trạng thái công việc, lịch sử hoạt động và báo cáo tiến
                độ dễ dàng.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-surface-1 px-gap-md py-gap-xl">
        <div className="mx-auto max-w-2xl space-y-gap-md text-center">
          <h2 className="text-headline-lg font-heading text-ink">
            Sẵn sàng bắt đầu?
          </h2>
          <p className="text-body text-ink-muted">
            Tạo tài khoản miễn phí ngay — quản lý công việc hiệu quả hơn từ hôm
            nay.{' '}
          </p>
          <Link href="/register" className="block">
            <Button variant="default" size="lg">
              Tạo tài khoản miễn phí
            </Button>
          </Link>
        </div>
      </section>
    </main>
  );
}
