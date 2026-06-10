[English](README.md) · **한국어**

# 🎧 LP Record Player

<img width="1890" height="987" alt="image" src="https://github.com/user-attachments/assets/0982aa43-7875-45c2-8be7-ffeaeb7a6bf8" />


프론트엔드 포트폴리오로 만든 웹 바이닐 뮤직 플레이어입니다. "음악 앱 하나 더"라기보다는, 디자인과 애니메이션을 마음껏 다듬어 본 작은 놀이터에 가깝습니다.

재생 중에도 실시간으로 전환할 수 있는 **완전히 다른 두 가지 비주얼 아이덴티티**를 담았습니다:

- **Dark Neon** — 거의 검은 캔버스에 마젠타/시안 글로우, 날카로운 모서리, 굵은 디스플레이 타이포.
- **Light Minimal** — 따뜻한 크림 톤, 부드러운 그림자, 둥근 형태, 차분한 우아함.

> 🔗 **라이브 데모 → https://yeonjin1357.github.io/Vinyl-Player/**

## 주요 기능

- **가짜 UI가 아닌 실제 재생.** 숨겨진 `<audio>` 요소가 전체 트랜스포트(재생 / 일시정지 / 탐색 / 볼륨 / 이전·다음, 셔플, 3가지 반복 모드)를 구동합니다.
- **진짜로 듣는 비주얼라이저.** 방사형 스펙트럼 링이 Web Audio `AnalyserNode`로 움직여서, 미리 만든 애니메이션을 반복하는 게 아니라 음악에 실제로 반응합니다.
- **턴테이블답게 동작하는 디스크.** LP가 돌고, 일시정지하면 톤암이 들리며, 플래터는 멈췄던 _그 각도 그대로_ 다시 돌아갑니다 — 12시 방향으로 튕기지 않습니다.
- **커버가 디스크로 날아듭니다.** 라이브러리에서 앨범을 누르면 커버 아트가 턴테이블 중앙 라벨로 모핑됩니다(셰어드 엘리먼트 트랜지션).
- **앨범마다 공간의 색이 바뀝니다.** 강조색을 커버 아트에서 런타임에 추출합니다 — 흑백 재킷은 차분한 회색으로, 화려한 재킷은 선명하게 빛납니다.
- **2개 언어, 완전한 접근성.** EN / 한국어 토글, 키보드 조작, ARIA, 그리고 `prefers-reduced-motion` 전 구간 대응.

## 구현 디테일

개인적으로 만족스러운 결정들:

- **단일 소스 오브 트루스, 깔끔한 분리.** Zustand 스토어 하나가 _의도_(현재 트랙, 큐, 볼륨, 테마…)를 담고, `usePlayer` 훅이 _현실_(오디오 요소 + Web Audio 그래프)을 담당합니다. 현실은 오직 네이티브 미디어 이벤트를 통해서만 스토어로 되돌아가서 렌더 루프 충돌이 없습니다.
- **Web Audio 그래프는 한 번만 만듭니다.** 미디어 요소는 평생 단 하나의 `MediaElementAudioSourceNode`만 가질 수 있어서, 트랙 변경은 노드를 다시 만드는 게 아니라 `audioEl.src`를 교체해서 처리합니다. 볼륨은 분석 신호와 일치하도록 `GainNode`를 거치고, 프레임별 분석 데이터는 React 상태가 아니라 곧장 캔버스로 그립니다.
- **일시정지를 견디는 회전**은 회전량을 누적하는 GSAP 타임라인이라, `play()` / `pause()`가 멈춘 지점에서 정확히 이어집니다.
- **테마는 그냥 CSS 변수입니다.** `<html>`의 `data-theme`가 토큰 세트를 교체하고, Tailwind v4의 `@theme inline`이 이를 유틸리티로 연결합니다(`--bg` → `bg-bg`). 속성만 바꾸면 전체가 즉시 다시 칠해지고, `index.html`의 인라인 스크립트가 첫 페인트 전에 값을 설정해 깜빡임을 막습니다.
- **앨범은 하드코딩이 아니라 폴더 규칙**입니다. 작은 Node 스크립트가 `public/audio/`를 스캔해 카탈로그를 생성합니다(아래 참고).

## 앨범 추가하기

`public/audio/`에 `아티스트 - 앨범명 (연도)` 형식으로 폴더를 넣습니다 — `(연도)`는 선택이며 발매 연도를 지정합니다:

```
public/audio/
└── Arctic Monkeys - Whatever People Say I Am, That's What I'm Not (2006)/
    ├── cover.webp                          # cover.<webp|jpg|png>
    ├── 1.The View From The Afternoon.mp3   # N.제목.mp3, 재생 순서대로 번호
    ├── 2.I Bet You Look Good On The Dancefloor.mp3
    └── …
```

그런 다음 카탈로그를 재생성하고 결과를 커밋합니다:

```bash
pnpm gen:music   # 폴더를 스캔 → src/data/generatedAlbums.json
```

실제 앨범이 라이브러리 그리드 앞쪽에 오고, 남은 그라데이션 "더미" 앨범이 뒤를 채웁니다. 트랙 길이는 MP3 헤더에서 추정하고, 파일이 로드되면 런타임에 실제 값으로 확정됩니다.

## 시작하기

```bash
pnpm install
pnpm dev          # http://localhost:5173
```

| 명령어                      | 설명                                 |
| --------------------------- | ------------------------------------ |
| `pnpm dev`                  | 개발 서버 실행                       |
| `pnpm gen:music`            | `public/audio/` 폴더 스캔 → 카탈로그 |
| `pnpm build`                | 타입체크 + 프로덕션 빌드 → `dist/`   |
| `pnpm preview`              | 프로덕션 빌드 미리보기               |
| `pnpm lint` / `pnpm format` | 린트 / 포맷                          |
| `pnpm typecheck`            | 타입체크만                           |
| `pnpm test`                 | 단위 테스트 실행 (Vitest)            |

## 기술 스택

React 19 · TypeScript 6 · Vite 8 · Tailwind CSS v4 · Zustand 5 · Motion · GSAP · Web Audio API · i18next · Vitest

## 배포

`main`에 푸시하면 Actions(`.github/workflows/deploy.yml`)를 통해 **GitHub Pages**로 자동 배포됩니다. 빌드가 `DEPLOY_TARGET=gh-pages`로 실행되어 Vite의 `base`가 `/Vinyl-Player/`가 됩니다. 최초 1회 설정: 저장소 **Settings → Pages → Source: _GitHub Actions_**.

**Vercel**은 저장소를 임포트하면 그대로 동작합니다(Vite 자동 감지, 루트에서 서빙) — `vercel.json`이 빌드 명령과 SPA 리라이트를 제공합니다.

## 크레딧

그라데이션 "더미" 앨범은 로열티 프리 [SoundHelix](https://www.soundhelix.com) 음원을 사용합니다. 플레이어 데모용으로 추가한 실제 앨범(예: Arctic Monkeys 음반)은 **저작권이 있는 상업 음원·커버 아트**로, 로열티 프리 자산이 아니라 실제 콘텐츠로 플레이어를 보여주기 위해서만 포함했습니다. 전체 출처와 저작권 고지는 [`CREDITS.md`](CREDITS.md)를 참고하세요.

## 라이선스

코드는 포트폴리오 샘플입니다. 번들된 미디어는 각 출처의 라이선스를 따릅니다([`CREDITS.md`](CREDITS.md) 참고).
