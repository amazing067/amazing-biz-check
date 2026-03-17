<h1 align="center">매니저 출석 체크</h1>
<p align="center">TV 대시보드 · 출/퇴근 체크(태블릿)</p>
<p align="center"><strong>amazing-biz-check</strong></p>

---

## 소개

회사 TV와 태블릿에서 사용하는 **매니저 출석 체크 시스템**입니다.

- TV: 오늘의 명언, 전체 매니저 연락처, 오늘 출근한 매니저, 회사 소개 슬라이드
- 태블릿: 출근/퇴근 체크 화면

## 개발용 실행 방법

```bash
npm install
npm start      # 또는 npm run dev
```

배포 환경에서는 Vercel을 사용하며, 별도의 **도메인(예: `check.어메이징사업부.com`)** 으로 접속합니다.

## 데이터 수정

- 매니저 목록: `data/managers.json`
- 오늘의 명언: `data/quotes.json`
- 회사 로고: `public/logos` 폴더

## 주의

- 출근/퇴근 기록은 `data/attendance.json` 에 저장됩니다.
