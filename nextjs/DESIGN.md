---
version: 1.0
name: Treclone
description: "Hệ thống thiết kế cho ứng dụng quản lý Kanban cao cấp. Thay vì dùng các đường viền cứng nhắc, hệ thống tạo ranh giới bằng sự chuyển đổi màu nền (Tonal Layering). Giao diện sử dụng tone màu Warm Neutral sáng, font Manrope cho tiêu đề để tạo tính hiện đại và font Inter cho nội dung để đảm bảo độ dễ đọc. Các thành phần tương tác nổi (floating) sử dụng Glassmorphism mờ ảo thay vì shadow nặng nề."

colors:
  # The Layering Principle (Backgrounds)
  canvas: "#f7f9fb"              # Level 0 (The Floor): Nền của toàn bộ app
  surface-1: "#f0f4f7"           # Level 1 (The Columns): Nền của cột Kanban, tạo cảm giác lõm xuống
  surface-2: "#ffffff"           # Level 2 (The Cards): Nền của thẻ task, đón ánh sáng nhiều nhất
  surface-glass: "rgba(255, 255, 255, 0.8)" # Dành cho modal và trạng thái hover
  
  # Text & Ink
  ink: "#2a3439"                 # Chữ chính, mềm mại hơn màu đen pure black
  ink-muted: "#687783"           # Chữ phụ, metadata
  
  # Accents & Borders
  primary: "#0053dc"             # Gradient start
  primary-container: "#3e76fe"   # Gradient end
  on-primary: "#ffffff"
  hairline-ghost: "rgba(42, 52, 57, 0.2)" # Viền mờ 20% chỉ dùng khi bắt buộc (như input focus)
  
  # Semantics (Status Chips)
  semantic-blocked-bg: "#ffe0e0"
  semantic-blocked-text: "#d32f2f"
  semantic-progress-bg: "#d0e1ff"
  semantic-progress-text: "#0053dc"
  semantic-done-bg: "#d4f5d6"
  semantic-done-text: "#27a644"

typography:
  # The Voice (Manrope) - Editorial Authority
  headline-lg:
    fontFamily: "Manrope, sans-serif"
    fontSize: 24px
    fontWeight: 700
    lineHeight: 1.3
  headline-sm:
    fontFamily: "Manrope, sans-serif"
    fontSize: 20px
    fontWeight: 600
    lineHeight: 1.4
    
  # The Engine (Inter) - High Legibility
  title-md:
    fontFamily: "Inter, sans-serif"
    fontSize: 16px
    fontWeight: 600
    lineHeight: 1.5
  body:
    fontFamily: "Inter, sans-serif"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.5
  label-sm:
    fontFamily: "Inter, sans-serif"
    fontSize: 12px
    fontWeight: 500
    lineHeight: 1.4
  button:
    fontFamily: "Inter, sans-serif"
    fontSize: 14px
    fontWeight: 600
    textTransform: uppercase
    letterSpacing: 0.05em

rounded:
  sm: 6px
  md: 12px                       # Bo góc chuẩn cho thẻ Kanban Card
  lg: 16px
  full: 9999px                   # Bo góc cho Status Chips

spacing:
  gap-xs: 4px
  gap-sm: 8px                    # Khoảng cách giữa các task trong list (spacing-1.5)
  gap-md: 16px                   # Padding trong của thẻ Card (spacing-3)
  gap-lg: 24px
  gap-xl: 32px

components:
  kanban-board:
    backgroundColor: "{colors.canvas}"
    padding: "{spacing.gap-xl}"
    
  kanban-column:
    backgroundColor: "{colors.surface-1}"
    typography: "{typography.headline-sm}"
    rounded: "{rounded.lg}"
    padding: "{spacing.gap-md}"
    border: none                 # NO-LINE RULE
    
  kanban-card:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "{spacing.gap-md}"
    border: none                 # NO-LINE RULE
    shadow: none                 # Tonal stacking thay thế shadow
    
  kanban-card-dragging:
    backgroundColor: "{colors.surface-glass}"
    backdropBlur: "12px"
    shadow: "0px 8px 24px -4px rgba(42, 52, 57, 0.06)" # Ambient shadow khi kéo thả
    
  status-chip:
    typography: "{typography.label-sm}"
    rounded: "{rounded.full}"
    padding: 4px 12px
    
  button-primary:
    backgroundGradient: "linear-gradient(135deg, {colors.primary}, {colors.primary-container})"
    textColor: "{colors.on-primary}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: 10px 16px
    
  text-input-focused:
    backgroundColor: "{colors.surface-2}"
    border: "1px solid {colors.hairline-ghost}" # Ghost border fallback
---

## 1. Overview & Principles

Ứng dụng này kết hợp sự chặt chẽ của một hệ thống quản lý Token với ngôn ngữ thiết kế "No-Line" (Không viền). Ranh giới giữa các cột và thẻ được cảm nhận qua sự thay đổi màu sắc (Tonal Stacking) chứ không phải qua các đường kẻ cứng nhắc.

**Quy tắc bất di bất dịch:**
- **Không dùng viền 1px (No-Line):** Tuyệt đối không dùng `border: 1px solid` để chia cột. Các cột nằm lõm xuống nền bằng `{colors.surface-1}`.
- **Không đổ bóng vô tội vạ:** Thẻ task nằm trên cột chỉ cần dùng màu `{colors.surface-2}` là đủ để nổi lên. Bóng đổ (Ambient Shadow) chỉ xuất hiện ở trạng thái Active (khi người dùng đang Drag & Drop thẻ).
- **Tránh màu đen tuyền:** Không dùng `#000000` cho text, luôn dùng `{colors.ink}` để tạo sự cao cấp.

## 2. Component Architecture (React/Next.js)

- **`Board`**: Nền `{colors.canvas}`. Nơi quản lý State của DnD (Drag and Drop).
- **`Column`**: Nền `{colors.surface-1}`. Tiêu đề sử dụng font Manrope `{typography.headline-sm}`. Các cột cách nhau một khoảng lớn để dễ thở.
- **`Card`**: Nền `{colors.surface-2}`, bo góc 12px. Nội dung bên trong chia làm 2 phần: Tiêu đề `{typography.title-md}` và Meta/Status ở dưới. Khoảng cách giữa các khối trong thẻ là `{spacing.gap-sm}`.

## 3. Drag and Drop States (UX Mượt mà)

Khi một `Card` bị nhấc lên (Dragging state):
1. Thẻ gốc để lại một ô trống (Placeholder) có màu trùng với `{colors.canvas}`.
2. Thẻ đang bay theo con trỏ chuột sẽ chuyển background sang `{colors.surface-glass}`, bật hiệu ứng `backdrop-blur: 12px`, và xuất hiện đổ bóng nhẹ `0px 8px 24px -4px rgba(42, 52, 57, 0.06)`.