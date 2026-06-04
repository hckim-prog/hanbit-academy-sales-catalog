# Hanbit Academy Sales Catalog

한빛아카데미 영업자가 교수 방문 상담 중 태블릿PC로 도서를 빠르게 찾고, 강좌 적합성을 설명하고, 관심 도서를 Gmail 작성창으로 공유하기 위한 SaaS형 웹 카탈로그입니다. 일반 도서몰이나 쇼핑몰 UI가 아니라 교수 상담 현장의 검색, 필터, 비교, 공유 흐름을 우선합니다.

## 실행 방법

```bash
npm install
npm run dev
```

개발 서버가 뜨면 표시된 Vite URL로 접속합니다. 앱은 `data/books_merged.json`에 운영 데이터가 있으면 그 파일을 우선 사용하고, 비어 있을 때만 `data/books_merged.sample.json`의 샘플 도서 10권을 사용합니다.

## 개발 서버

```bash
npm run dev
```

태블릿 가로 화면 기준으로 검색창, 빠른 필터, AI 분야 카드, 강좌 태그, 도서 카드, 관심 도서 Sheet가 한 화면 흐름 안에 보이도록 구성했습니다.

## 현재 데이터가 샘플인지 전체 데이터인지 확인

```bash
node -e "const fs=require('fs'); for (const f of ['data/books_raw.json','data/books_merged.json']) { const rows=JSON.parse(fs.readFileSync(f,'utf8')); console.log(f, rows.length); }"
```

`books_merged.json`이 0권이면 앱은 샘플 데이터를 보여줍니다. `crawl:test` 실행 직후에는 보통 10권만 들어 있으므로 UI/표지 테스트 데이터입니다. 실제 운영 카탈로그는 `crawl:all` 실행 후 전체도서목록 기준 수집 권수가 들어간 상태를 기준으로 합니다.

## 크롤링 실행

```bash
npm run crawl
```

기본 크롤링 기준은 한빛아카데미 전체도서목록입니다.

```text
https://www.hanbit.co.kr/academy/books/full_book_list.html
```

`new_book_list.html`은 전체 도서 기준으로 사용하지 않습니다. 새로나온책 참고나 신간 표시 보조 데이터가 필요할 때만 별도로 참고합니다.

크롤러는 먼저 전체 목록 다운로드 폼(`full_book_list_down.php`)을 확인해 ISBN, 페이지, 원본 분류 같은 기본 메타를 보강합니다. 다만 다운로드 파일에는 상세 URL이 없고 행 수가 페이지네이션과 다를 수 있으므로, 실제 상세 URL 수집 기준은 `full_book_list.html` 페이지네이션 전체 순회입니다.

각 상세페이지에서 표지 URL, 부제, 책소개, 목차, ISBN/eISBN, 페이지 수, 물류코드, 전자책 여부, 대여 가능 여부, 부록/예제소스 여부를 추가로 수집합니다. 실패한 URL은 `logs/crawl_errors.json`에 남기고 전체 크롤링은 계속 진행합니다.

## `crawl:test`와 `crawl:all`

```bash
npm run crawl:test
```

앞 10권만 수집한 뒤 `classify`와 `merge`까지 실행합니다. UI, 표지 URL, 카드 렌더링 확인용입니다.

```bash
npm run crawl:all
```

전체도서목록의 모든 페이지를 끝까지 순회하고 모든 상세페이지를 수집한 뒤 `classify`와 `merge`까지 실행합니다. 실제 운영 데이터 생성용입니다.

요청 간격은 기본 650ms입니다.

```bash
CRAWL_DELAY_MS=1000 npm run crawl
```

Windows PowerShell에서는 다음처럼 실행할 수 있습니다.

```powershell
$env:CRAWL_DELAY_MS='1000'; npm run crawl:all
```

## AI 분류 실행

```bash
npm run classify
```

`scripts/classify-books.ts`는 `books_raw.json`을 읽어 영업용 1차 분야, 추천 강좌 태그, 대상 학과, 난이도, 신뢰도, 분류 이유, 검수 필요 여부를 `data/books_ai_classified.json`에 저장합니다.

현재 MVP는 규칙 기반 분류 스캐폴드입니다. 실제 LLM API를 연결하더라도 `confidence`, `classification_reason`, `review_required`는 반드시 유지해야 합니다.

## 데이터 병합

```bash
npm run merge
```

병합 순서:

```text
data/books_raw.json
+ data/books_ai_classified.json
+ data/books_sales_meta.json
= data/books_merged.json
```

공식 도서 정보는 원본 데이터를 기준으로 하고, 분야와 강좌 태그 초안은 AI 분류를 기준으로 합니다. 영업 우선순위, 전략도서 여부, 상담 멘트, 강의자료 여부는 `books_sales_meta.json`의 값을 우선합니다.

## 업데이트 리포트

```bash
npm run update:books
```

업데이트 스크립트는 현재 `books_raw.json`을 `books_raw.previous.json`으로 보관한 뒤 재크롤링하고, 신규 도서, 변경 도서, 삭제 또는 비노출 후보, 재분류 대상, 검수 필요 후보, 크롤링 실패 URL을 `data/update_report.json`에 저장합니다.

웹앱 첫 화면의 업데이트 상태 패널은 `data/update_report.json`을 읽어 표시합니다.

## 배포 방법

Vercel 배포 전 로컬 빌드를 확인합니다.

```bash
npm run build
```

Vercel에서는 일반 Vite 프로젝트로 배포하면 됩니다. 빌드 명령은 `npm run build`, 출력 폴더는 `dist`입니다.

## 데이터 파일 설명

- `data/books_raw.json`: 한빛 사이트에서 자동 수집한 원본 데이터입니다. 재크롤링 시 갱신될 수 있습니다.
- `data/books_ai_classified.json`: 도서 상세 내용 기반 AI 또는 규칙 기반 영업 분류 결과입니다.
- `data/books_sales_meta.json`: 영업자가 직접 보강하는 데이터입니다. 자동 업데이트 과정에서 삭제하거나 덮어쓰면 안 됩니다.
- `data/books_merged.json`: 실제 운영 카탈로그에서 사용할 최종 병합 데이터입니다.
- `data/books_merged.sample.json`: UI 개발용 샘플 데이터 10권입니다.
- `data/update_report.json`: 정기 업데이트 검수 리포트입니다.
- `logs/crawl_errors.json`: 크롤링 실패 URL과 사유입니다.

## 크롤링 실패 확인

크롤링 중 일부 상세페이지가 실패해도 전체 작업은 중단되지 않습니다. 실패 URL과 사유는 아래 파일에서 확인합니다.

```bash
cat logs/crawl_errors.json
```

## 정기 업데이트 운영 방식

초기에는 담당자가 수동으로 `npm run update:books`, `npm run classify`, `npm run merge` 순서로 실행합니다. 안정화 후 GitHub Actions에서 매주 월요일 오전에 같은 명령을 실행하도록 분리할 수 있습니다.

가격, 출간일, 표지, 전자책 여부 같은 기본 정보는 자동 반영하고, 분야 분류, 추천 강좌, 채택 포인트, 교수 상담 문구는 검수 후 반영합니다.

## 주의사항

- 재크롤링 시 `books_sales_meta.json`은 절대 덮어쓰지 마세요.
- `source_category`는 참고용 원본 카테고리이며 최종 웹 카탈로그 분야로 사용하지 마세요.
- AI 분류 결과에는 반드시 `confidence`와 `classification_reason`을 남기세요.
- `confidence < 0.70` 또는 분야 충돌이 있으면 `review_required: true`로 표시하세요.
- 크롤링 실패가 있어도 전체 작업이 중단되지 않도록 실패 URL을 로그로 남기세요.
- 교수전용 자료와 내부 전용 메모는 외부 메일 본문에 자동 포함하지 마세요.
