const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
const API_KEY = "dfa5549770ab47b7921b3ae0763768df";

let newsList = [];
let page = 1;
const pageSize = 10;
const groupSize = 5;
let totalResults = 0;

let url; 



async function getNews() {
  try {
    url.searchParams.set("page", page);
    url.searchParams.set("pageSize", pageSize);

    const res = await fetch(url);
    const data = await res.json();

    if (res.status === 200) {
      if (!data.articles || data.articles.length === 0) {
        throw new Error("검색된 뉴스가 없습니다.");
      }
      newsList = data.articles;
      totalResults = data.totalResults;
      render();
      pagenationRender();
    } else {
      throw new Error(data.message || `[${res.status}] 에러가 발생했습니다.`);
    }
  } catch (err) {
    console.error("API 호출 에러:", err);
    errorRender(err.message);
  }
}

function render() {
  const newsHTML = newsList.map(item => `
    <div class="row news-data g-4 align-items-start">
      <div class="col-12 col-md-4">
        <a class="urlImgTag d-block" href="${item.url}" target="_blank">
          <img
            class="thumbnails img-fluid"
            loading="lazy"
            src="${item.urlToImage || './image/notImage.png'}"
            onerror="this.onerror=null;this.src='./image/notImage.png';"
            alt=""
          />
        </a>
      </div>
      <div class="col-12 col-md-8 news-title">
        <h2><a class="urlTag" href="${item.url}" target="_blank">${item.title || "No title"}</a></h2>
        <p><a class="urlContentTag" href="${item.url}" target="_blank">
          ${item.content ? (item.content.length > 200 ? item.content.slice(0, 200) + "... Click" : item.content) : "No content"}
        </a></p>
        <p class="news-meta">${item.source.name || "No source"} ċ ${moment(item.publishedAt).fromNow()}</p>
      </div>
    </div>
  `).join("");
  document.getElementById("news-board").innerHTML = newsHTML;
}

function pagenationRender() {
  const totalPages = Math.ceil(totalResults / pageSize);
  const pageGroup = Math.ceil(page / groupSize);

  let lastPage = pageGroup * groupSize;
  if (lastPage > totalPages) lastPage = totalPages;

  let firstPage = lastPage - (groupSize - 1) <= 0 ? 1 : lastPage - (groupSize - 1);
  
  let paginationHTML = "";

  if (page > 1) {
    paginationHTML += `
      <li class="page-item" data-page="1"><a class="page-link" href="#">«</a></li>
      <li class="page-item" data-page="${page - 1}"><a class="page-link" href="#"><</a></li>
    `;
  }

  for (let i = firstPage; i <= lastPage; i++) {
    paginationHTML += `<li class="page-item ${i === page ? 'active' : ''}" data-page="${i}"><a class="page-link" href="#">${i}</a></li>`;
  }

  if (page < totalPages) {
    paginationHTML += `
      <li class="page-item" data-page="${page + 1}"><a class="page-link" href="#">></a></li>
      <li class="page-item" data-page="${totalPages}"><a class="page-link" href="#">»</a></li>
    `;
  }

  document.querySelector(".pagination").innerHTML = paginationHTML;
}

function errorRender(errorMessage) {
  const errorHTML = `<div class="alert alert-danger" role="alert">${errorMessage}</div>`;
  document.getElementById("news-board").innerHTML = errorHTML;
}



function getNewsByCategory(category) {
  if (isLocal) {
    url = new URL(`https://newsapi.org/v2/top-headlines?country=us&category=${category}&apiKey=${API_KEY}`);
  } else {
    url = new URL(`${window.location.origin}/.netlify/functions/getNews?country=us&category=${category}`);
  }
  page = 1;
  getNews();
}

function getNewsByKeyword() {
  const keyword = document.querySelector(".search-input").value.trim();
  if (keyword === "") {
    setInitialUrlAndFetch();
    return;
  }
  
  if (isLocal) {
    url = new URL(`https://newsapi.org/v2/top-headlines?country=us&q=${encodeURIComponent(keyword)}&apiKey=${API_KEY}`);
  } else {
    url = new URL(`${window.location.origin}/.netlify/functions/getNews?country=us&q=${encodeURIComponent(keyword)}`);
  }
  page = 1;
  getNews();
}

function moveToPage(pageNum) {
  if (pageNum < 1 || pageNum > Math.ceil(totalResults / pageSize)) return;
  page = pageNum;
  getNews();
}

function setInitialUrlAndFetch() {
  if (isLocal) {
    url = new URL(`https://newsapi.org/v2/top-headlines?country=us&apiKey=${API_KEY}`);
  } else {
    url = new URL(`${window.location.origin}/.netlify/functions/getNews?country=us`);
  }
  page = 1;
  getNews();
}

function openNav() {
  document.getElementById("mySidenav").style.width = "250px";
}
function closeNav() {
  document.getElementById("mySidenav").style.width = "0";
}
function openSearchBox() {
  const inputArea = document.getElementById("input-area");
  inputArea.style.display = inputArea.style.display === "inline" ? "none" : "inline";
}


// 카테고리 메뉴 버튼들
document.querySelectorAll(".menus button, .side-menu-list button").forEach(btn =>
  btn.addEventListener("click", (e) => getNewsByCategory(e.target.textContent.toLowerCase()))
);

// 검색 입력창 (엔터 키)
document.querySelector(".search-input").addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    getNewsByKeyword();
  }
});

// 검색 버튼 ('Go')
document.querySelector(".search-button").addEventListener("click", getNewsByKeyword);

// 햄버거 아이콘 클릭 시
document.getElementById("hamburger-icon").addEventListener("click", openNav);

// 검색 아이콘 클릭 시
document.getElementById("search-icon").addEventListener("click", openSearchBox);

// 사이드 메뉴 닫기 버튼 클릭 시
document.querySelector(".closebtn").addEventListener("click", closeNav);

// 페이지네이션 클릭 (이벤트 위임)
document.querySelector(".pagination").addEventListener("click", (e) => {
  // 클릭된 요소가 <A> 태그가 아니면 무시
  if (e.target.tagName !== 'A') return;

  e.preventDefault();
  const pageNum = e.target.closest('li').dataset.page;
  if(pageNum){
    moveToPage(parseInt(pageNum));
  }
});


// --- 최초 실행 ---
setInitialUrlAndFetch();