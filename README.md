# WhatToDo - Minimalist Productivity Tool

![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black?style=flat-square&logo=next.js)
![Supabase](https://img.shields.io/badge/Supabase-Database-blue?style=flat-square&logo=supabase)
![Zustand](https://img.shields.io/badge/Zustand-State%20Management-orange?style=flat-square)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-UI-38B2AC?style=flat-square&logo=tailwind-css)

**WhatToDo**는 복잡한 기능은 덜어내고, '오늘 무엇을 할 것인가'에 집중할 수 있도록 설계된 미니멀리스트 생산성 도구입니다.

---

## 🚀 주요 기능 소개

### 1. 지능형 할 일 관리

- **Inbox & Categories**: 모든 할 일은 Inbox에 담기며, 사용자가 정의한 카테고리로 분류할 수 있습니다.
- **날짜 시스템**:
  - `Due Date`: 지키지 않으면 안 되는 최종 마감일.
  - `Planned Date`: "오늘" 또는 "내일" 실행하기로 마음먹은 실질적인 계획일.
- **상태 배지**: 마감일까지 남은 기간에 따라 색상이 자동으로 변합니다. (D-3 이내: 빨간색, D-4 이상: 주황색, D+: 회색)

### 2. 가시성 및 데이터 최적화

- **15일 자동 필터**: 완료된 할 일 중 15일이 지난 항목은 목록에서 자동으로 숨겨져 항상 쾌적한 화면을 유지합니다.
- **진행률 피드백**: Today 페이지에서 하단 진행률(2/4 50%)을 통해 오늘의 성취도를 한눈에 확인합니다.
- **축하 애니메이션**: 모든 할 일이 완료되어 100%에 도달하면 화려한 폭죽(Confetti) 효과로 성취감을 더합니다.

### 3. 직관적인 UI/UX

- **원클릭 삭제**: 마우스 호버 시 나타나는 휴지통 버튼으로 즉각적인 정리가 가능합니다.
- **부드러운 인터랙션**: Framer Motion을 활용한 부들부들한 애니메이션과 드래그 앤 드롭 카테고리 순서 변경.
- **다크 모드 지원**: 사용자 시스템 설정에 맞춘 테마 전환.

---

## 🛠 작동 원리 (Technical Background)

### 데이터 흐름

1. **Supabase Realtime**: 데이터베이스와 소통하며 모든 변경사항은 실시간으로 저장됩니다.
2. **Zustand Store**: 중앙 집중식 상태 관리를 통해 여러 뷰(`Today`, `Calendar`, `Category`)에서 동일한 데이터를 동기화합니다.
3. **Optimistic Updates**: 사용자가 행동하는 즉시 UI를 먼저 업데이트하고 서버와 통신하여 쾌적한 속도를 보장합니다.

### 핵심 로직 (`TodoItem.tsx`)

- `getDiffDays` 함수를 통해 현재 서버 시간이 아닌 클라이언트 로컬 시간을 기준으로 날짜 차이를 계산하여 사용자 친화적인 D-day 정보를 제공합니다.

---

## 🔧 유지보수 및 기능 확장 가이드

### 환경 변수 설정

`.env.local` 파일에 다음 정보가 필요합니다:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 새로운 기능 추가하기

- **알림 기능**: `pushNotification.ts`에 이미 기초 프레임워크가 잡혀 있으므로, Firebase Cloud Messaging 등을 연결하여 푸시 알림을 확장할 수 있습니다.
- **통계 대시보드**: `useTodoStore`의 `todos` 배열을 활용해 주간/월간 성취 통계 차트를 추가할 수 있습니다.
- **보관(Archive) 기능**: `is_archived` 필드가 이미 DB와 타입에 준비되어 있습니다. 15일이 지난 데이터의 `is_archived`를 true로 업데이트하는 서버리스 함수를 추가하여 성능을 더욱 최적화할 수 있습니다.

### 설치 및 시작

```bash
npm install
npm run dev
```

---

## 📝 라이선스

개인 프로젝트용으로 제작되었습니다.

---

> "복잡함이 생산성을 방해하지 않도록."
