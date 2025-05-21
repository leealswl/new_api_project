const isLocal = window.location.hostname === "localhost";
let baseUrl;

if (isLocal) {
  const API_KEY = "dfa5549770ab47b7921b3ae0763768df";
  baseUrl = `https://newsapi.org/v2/top-headlines?country=us&apiKey=${API_KEY}`;
} else {
  baseUrl = "/.netlify/functions/getNews?country=us";
}


let newsList = [];
let page = 1;
const pageSize = 10;
const groupSize = 5;
let totalResults = 0;

let url = new URL(`/.netlify/functions/getNews?country=us`, window.location.origin);


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

async function getNews() {
  try {
    const url = isLocal
    ? new URL(baseUrl) // 로컬일 땐 이미 querystring 포함
    : new URL(baseUrl, window.location.origin);

  // 페이지네이션 파라미터 추가
  url.searchParams.set("page", page);
  url.searchParams.set("pageSize", pageSize);

  const res = await fetch(url);
  const data = await (isLocal ? res.json() : res.json());
  console.log("응답 데이터 확인:", data);

  if (res.status === 200 && Array.isArray(data.articles)) {
    if (!data.articles.length) throw new Error("No results");
    newsList = data.articles;
    totalResults = data.totalResults;
    render();
    pagenationRender();
  } else {
    throw new Error(data.message || "Unknown error");
  }
} catch (err) {
  console.error("error메세지", err);
  errorRender(err.message);
}
}
getNews();

function render() {
  const newsHTML = newsList.map(item => `
    <div class="row news-data">
      <div class="col-lg-4">
        <a class="urlImgTag" href="${item.url}" target="_blank">
          <img class="thumbnails" src="${item.urlToImage || './image/notlmage.png'}" />
        </a>
      </div>
      <div class="col-lg-8 news-title">
        <h2>
          <a class="urlTag" href="${item.url}" target="_blank">
            ${item.title || "No title"}
          </a>
        </h2>
        <p>
          <a class="urlContentTag" href="${item.url}" target="_blank">
            ${item.content
              ? (item.content.length > 200
                  ? item.content.slice(0, 200) + "... Click"
                  : item.content)
              : "No content"}
          </a>
        </p>
        <p>
          ${item.source.name || "No source"}
          ${moment(item.publishedAt).fromNow()}
        </p>
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

  let firstPage = lastPage - (groupSize - 1);
  if (firstPage < 1) firstPage = 1;

  if (totalPages <= 5) {
    firstPage = 1;
    lastPage = Math.min(3, totalPages);
  }

  const remainingPages = totalPages % groupSize;
  if (remainingPages > 0 && lastPage === totalPages) {
    firstPage = totalPages - remainingPages + 1;
  }

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

  document.querySelector(".pagination").innerHTML = paginationHTML;
}

function moveToPage(pageNum) {
  page = pageNum;
  getNews();
}

function errorRender(errorMessage) {
  const errorHTML = `
    <div class="alert alert-danger" role="alert">
      ${errorMessage}
    </div>
  `;
  document.getElementById("news-board").innerHTML = errorHTML;
}


document.querySelectorAll(".menus button")
  .forEach(btn =>
    btn.addEventListener("click", e => {
      const category = e.target.textContent.toLowerCase();
      url = new URL(
        `/.netlify/functions/getNews?country=us&category=${category}`,
        window.location.origin
      );
      page = 1;
      getNews();
    })
  );

document.querySelectorAll(".side-menu-list button")
  .forEach(btn =>
    btn.addEventListener("click", e => {
      const category = e.target.textContent.toLowerCase();
      url = new URL(
        `/.netlify/functions/getNews?country=us&category=${category}`,
        window.location.origin
      );
      page = 1;
      getNews();
    })
  );

const searchInput = document.querySelector(".search-input");
searchInput.addEventListener("keydown", e => {
  if (e.key === "Enter") {
    const keyword = searchInput.value.trim();
    url = new URL(
      `/.netlify/functions/getNews?country=us&q=${encodeURIComponent(keyword)}`,
      window.location.origin
    );
    page = 1;
    getNews();
  }
});
