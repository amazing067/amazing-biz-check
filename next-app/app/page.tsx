 "use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const NOTICE_PASSWORD = "amazing1234";

  function verifyPassword(sessionKey?: string) {
    const input = window.prompt("비밀번호를 입력하세요.");
    if (input === null) return false;
    if (input.trim() !== NOTICE_PASSWORD) {
      window.alert("비밀번호가 올바르지 않습니다.");
      return false;
    }
    if (sessionKey) {
      sessionStorage.setItem(sessionKey, "1");
    }
    return true;
  }

  function handleNoticeAdminClick() {
    if (!verifyPassword("notice-admin-auth-ok")) return;
    router.push("/notice-admin.html");
  }

  function handleTvPublicAssetsClick() {
    if (!verifyPassword("tv-public-assets-auth-ok")) return;
    router.push("/tv-public-admin.html");
  }

  function handleCheckinClick() {
    if (!verifyPassword("checkin-auth-ok")) return;
    router.push("/checkin.html");
  }

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
        <Link href="/tv-gj2.html" className="landing-button">
          📺 TV 대시보드 (광진2지점)
        </Link>
        <Link href="/tv-public.html" className="landing-button">
          📺 TV 대시보드 (공용)
        </Link>
        <button type="button" className="landing-button" onClick={handleCheckinClick}>
          ✅ 출근 / 퇴근 체크 (태블릿)
        </button>
        <button type="button" className="landing-button" onClick={handleNoticeAdminClick}>
          📝 공지사항 수정 (광진2/공용)
        </button>
        <button type="button" className="landing-button" onClick={handleTvPublicAssetsClick}>
          🖼️ TV 공용 제안서·PDF 등록
        </button>
      </div>
    </div>
  );
}
