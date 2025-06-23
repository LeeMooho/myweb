import React from 'react';

// 홈 페이지 컴포넌트 정의
export default function Home() {
  // 프로젝트 데이터 배열
  const projects = [
    {
      title: "This website",
      subtitle: "React + Spring Boot + Docker",
      desc: "You can find more information on my GitHub",
      url: "https://github.com/LeeMooho/myweb",
      image: "/images/board.png",
      type: "Website"
    },
    {
      title: "My web Mobile",
      subtitle: "Android Studio",
      desc: "Mobile application for Android OS",
      url: "https://github.com/LeeMooho/mywebmobile",
      image: "/images/mywebmobile.jpg",
      type: "Mobile Application",
      download : "/download/app-release.apk" // Version: 2025-06-22
    },
    {
      title: "Stack and Slide",
      subtitle: "Unity",
      desc: "Block Stacking game for android OS",
      url: "https://github.com/LeeMooho/stack-and-Slide",
      image: "/images/game.png",
      type: "Mobile Game",
      download : "/download/universal.apk" // Version: 2025-06-22
    }
  ];

  return (
    <div className="container">

      {/* 헤더 영역 */}
      <header className="border-bottom lh-1 py-3">
        <div className="row flex-nowrap justify-content-between align-items-center">
          <div className="col-4 pt-1">
            <a className="link-secondary" href="#"></a>
          </div>
          <div className="col-4 text-center">
            <a className="blog-header-logo text-body-emphasis text-decoration-none" href="#">
              {/* 타이틀 숨김 처리 */}
            </a>
          </div>
          <div className="col-4 d-flex justify-content-end align-items-center">
            <a className="link-secondary" href="#" aria-label="Search">
              {/* 검색 아이콘 숨김 처리 */}
            </a>
            <a className="btn btn-sm btn-outline-secondary" href="#" style={{ display: "none" }}>
              Sign up
            </a>
          </div>
        </div>
      </header>

      {/* 메인 소개 섹션 */}
      <main className="container">
        <div className="p-4 p-md-5 mb-4 rounded text-body-emphasis bg-body-secondary">
          <div className="col-lg-6 px-0">
            <h1 className="display-4 fst-italic">Welcome!</h1>
            <p className="lead my-3">Hello, This is Mooho's website</p>
            <p className="lead my-3">Here is my GitHub URL</p>
            <p className="lead mb-0">
              <a href="https://github.com/LeeMooho" className="text-body-emphasis fw-bold">
                GitHub
              </a>
            </p>
          </div>
        </div>

        {/* 프로젝트 리스트 출력 */}
        <div className="row mb-2">
          {projects.map((item, index) => (
            <div className="col-md-6" key={index}>
              <div className="row g-0 border rounded overflow-hidden flex-md-row mb-4 shadow-sm h-md-250 position-relative">
                <div className="col p-4 d-flex flex-column position-static">
                  <strong className="d-inline-block mb-2 text-primary-emphasis">
                    {item.type}
                  </strong>
                  <h3 className="mb-0">{item.title}</h3>
                  <div className="mb-1 text-body-secondary">{item.subtitle}</div>
                  <p className="mb-auto">{item.desc}</p>
                  <a href={item.url}>
                    Link
                  </a>
                  {item.download && (
                    <a href={item.download} download>
                      Download
                    </a>
                    )
                  }
                </div>
                <div className="col-auto d-none d-lg-block">
                  <img src={item.image} width="200" height="250" alt="thumbnail" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
