import Link from "next/link";

export default function Home() {
  return (
    <div className="landing-root">
      <div className="landing-brand">
        <img
          src="/logos/amazinglogo.png"
          alt="어메이징 사업부 로고"
          className="landing-brand-logo"
        />
        <div className="landing-brand-name">어메이징 사업부</div>
      </div>

      <h1 className="landing-title">매니저 출석 체크</h1>
      <p className="landing-subtitle">TV 대시보드 · 출/퇴근 체크(태블릿)</p>

      <div className="landing-buttons">
        <Link href="/tv.html" className="landing-button">
          📺 TV 대시보드 (메인 화면)
        </Link>
        <Link href="/checkin.html" className="landing-button">
          ✅ 출근 / 퇴근 체크 (태블릿)
        </Link>
      </div>
    </div>
  );
}
