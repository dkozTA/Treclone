import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default async function MarketingHomePage() {
  const session = await getServerSession();

  if (session) {
    redirect('/boards');
  }

  // Chưa đăng nhập -> Render HTML của Landing Page
  return (
    <main>
      {/* Hero Section */}
      <section className="bg-surface-1 py-gap-xl px-gap-md">
        <div className="max-w-4xl mx-auto text-center space-y-gap-md">
          <h1 className="text-5xl font-heading font-bold text-ink leading-tight">
            Treclone mang tất cả nhiệm vụ lại với nhau
          </h1>
          <p className="text-title-md text-ink-muted max-w-2xl mx-auto">
            Quản lý dự án, tổ chức công việc và cộng tác với đội ngũ của bạn một cách dễ dàng.
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
      <section className="bg-canvas py-gap-xl px-gap-md">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-headline-lg font-heading text-ink text-center mb-gap-xl">
            Tính năng chính
          </h2>
          <div className="grid md:grid-cols-3 gap-gap-lg">
            {/* Feature 1 */}
            <div className="bg-surface-2 rounded-sm p-gap-md space-y-gap-sm">
              <div className="w-12 h-12 bg-primary rounded-sm" />
              <h3 className="text-title-md font-heading text-ink">Quản lý dễ dàng</h3>
              <p className="text-body text-ink-muted">
                Drag and drop các thẻ để sắp xếp công việc một cách trực quan
              </p>
            </div>
            {/* Feature 2 */}
            <div className="bg-surface-2 rounded-sm p-gap-md space-y-gap-sm">
              <div className="w-12 h-12 bg-primary rounded-sm" />
              <h3 className="text-title-md font-heading text-ink">Cộng tác nhóm</h3>
              <p className="text-body text-ink-muted">
                Chia sẻ bảng với đội ngũ và làm việc cùng nhau thời gian thực
              </p>
            </div>
            {/* Feature 3 */}
            <div className="bg-surface-2 rounded-sm p-gap-md space-y-gap-sm">
              <div className="w-12 h-12 bg-primary rounded-sm" />
              <h3 className="text-title-md font-heading text-ink">Theo dõi tiến độ</h3>
              <p className="text-body text-ink-muted">
                Xem trạng thái công việc và quản lý deadline một cách hiệu quả
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-surface-1 py-gap-xl px-gap-md">
        <div className="max-w-2xl mx-auto text-center space-y-gap-md">
          <h2 className="text-headline-lg font-heading text-ink">
            Sẵn sàng bắt đầu?
          </h2>
          <p className="text-body text-ink-muted">
            Tạo tài khoản miễn phí ngay hôm nay và bắt đầu quản lý dự án của bạn
          </p>
          <Link href="/register">
            <Button variant="default" size="lg">
              Tạo tài khoản miễn phí
            </Button>
          </Link>
        </div>
      </section>
    </main>
  );
}