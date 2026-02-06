# 🪙 숨은 보조금 찾아드림

행정안전부 보조금24 공공데이터 API를 활용한 정부 보조금 검색 서비스

## 배포 방법 (Vercel)

### 방법 1: GitHub 연동 (추천)
1. GitHub에 이 프로젝트를 push
2. [vercel.com](https://vercel.com) 가입 (GitHub 계정으로)
3. "New Project" → GitHub 레포 선택 → Deploy

### 방법 2: Vercel CLI
```bash
npm i -g vercel
cd subsidy-app
vercel
```

## 로컬 개발
```bash
npm install
npm run dev
```

## API
- 공공데이터포털: https://www.data.go.kr/data/15113968/openapi.do
- 인증키는 `/api/*.js` 서버리스 함수에서 관리 (클라이언트 노출 없음)

## 기술 스택
- Vite + React 18
- Vercel Serverless Functions (API 프록시)
- PWA 지원
