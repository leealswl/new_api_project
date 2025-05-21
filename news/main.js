// main.js

// 더 이상 클라이언트에서 API_KEY를 직접 사용하지 않습니다.
// let API_KEY = "...";  <-- 삭제

let newsList = [];
let page = 1;
const pageSize = 10;
const groupSize = 5;
let totalResults = 0;

// 기본 URL을 Netlify 함수 엔드포인트로 설정
let url = new URL(`/.netlify/functions/getNews?country=us`, window.location.origin);

// 페이지네이션, 카테고리, 검색어 등 파라미터만 붙여서 호출합니다.
const getNews = async () => {
  try {
    url.searchParams.set("page", page);
    url.searchParams.set("pageSize", pageSize);

    const response = await fetch(url);
    const data = await response.json();

    if (response.status === 200) {
      if (data.articles.length === 0) {
        throw new Error("No result for this search");
      }
      newsList = data.articles;
      totalResults = data.totalResults;
      render();
      pagenationRender();
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.log("error메세지", error.message);
    errorRender(error.message);
  }
};

// 초기 호출
getNews();

// 페이지네이션 UI 그리기 (기존 코드 그대로)
const pagenationRender = () => {
  const totalPages = Math.ceil(totalResults / pageSize);
  const pageGroup = Math.ceil(page / groupSize);
  let lastPage = pageGroup * groupSize;
  if (lastPage > totalPages) lastPage = totalPages;
  let firstPage = lastPage - (groupSize - 1);
  if (firstPage < 1) firstPage = 1;

  let paginationHTML = "";
  if (firstPage > 1) {
    paginationHTML += `
      <li class="page-item">
        <a class="page-link" href="#" onclick="moveToPage(1)">&laquo;</a>
      </li>
      <li class="page-item">
        <a class="page-link" href="#" onclick="moveToPage(${page - 1})">&lt;</a>
      </li>
    `;
  }
  for (let i = firstPage; i <= lastPage; i++) {
    paginationHTML += `
      <li class="page-item ${i === page ? "active" : ""}" data-page="${i}">
        <a class="page-link" href="#" onclick="moveToPage(${i})">${i}</a>
      </li>
    `;
  }
  if (lastPage < totalPages) {
    paginationHTML += `
      <li class="page-item">
        <a class="page-link" href="#" onclick="moveToPage(${page + 1})">&gt;</a>
      </li>
      <li class="page-item">
        <a class="page-link" href="#" onclick="moveToPage(${totalPages})">&raquo;</a>
      </li>
    `;
  }
  document.querySelector('.pagination').innerHTML = paginationHTML;
};

// 페이지 이동
const moveToPage = (pageNum) => {
  page = pageNum;
  getNews();
};

// 렌더링 함수 (기존 코드 그대로)
const render = () => {
  const newsHTML = newsList.map(item => `
    <div class="row news-data">
      <div class="col-lg-4">
        <a class="urlImgTag" href="${item.url}" target="_blank">
          <img class="thumbnails" src="${item.urlToImage || '/image/notlmage.png'}" />
        </a>
      </div>
      <div class="col-lg-8 news-title">
        <h2><a class="urlTag" href="${item.url}" target="_blank">
          ${item.title || "No title"}
        </a></h2>
        <p><a class="urlContentTag" href="${item.url}" target="_blank">
          ${item.content
            ? (item.content.length > 200
                ? item.content.slice(0, 200) + "...Click"
                : item.content)
            : "No content"}
        </a></p>
        <p>${item.source.name || "No source"} ${moment(item.publishedAt).fromNow()}</p>
      </div>
    </div>
  `).join('');
  document.getElementById('news-board').innerHTML = newsHTML;
};

// 에러 메시지 렌더
const errorRender = (msg) => {
  document.getElementById('news-board').innerHTML = `
    <div class="alert alert-danger" role="alert">${msg}</div>
  `;
};

// 네비게이션, 검색 이벤트 바인딩
const buttonList = document.querySelectorAll('.menus button');
buttonList.forEach(btn =>
  btn.addEventListener('click', e => {
    const cat = e.target.textContent.toLowerCase();
    url = new URL(`/.netlify/functions/getNews?country=us&category=${cat}`, window.location.origin);
    page = 1;
    getNews();
  })
);

const sideList = document.querySelectorAll('.side-menu-list button');
sideList.forEach(btn =>
  btn.addEventListener('click', e => {
    const cat = e.target.textContent.toLowerCase();
    url = new URL(`/.netlify/functions/getNews?country=us&category=${cat}`, window.location.origin);
    page = 1;
    getNews();
  })
);

const searchInput = document.querySelector('.search-input');
searchInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    const keyword = searchInput.value.trim();
    url = new URL(`/.netlify/functions/getNews?country=us&q=${keyword}`, window.location.origin);
    page = 1;
    getNews();
  }
});
