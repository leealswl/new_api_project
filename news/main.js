let newsList = [];
let page = 1;
const pageSize = 10;
const groupSize = 5;
let totalResults = 0;

// proxy 함수 경로로만 호출
let baseUrl = "/.netlify/functions/getNews";  

const getNews = async () => {
  try {
    let url = new URL(baseUrl, window.location.origin);
    url.searchParams.set("country", "us");
    url.searchParams.set("page", page);
    url.searchParams.set("pageSize", pageSize);

    const res = await fetch(url);
    const data = await res.json();
    console.log("응답 데이터 확인:", data);

    if (res.status === 200 && Array.isArray(data.articles)) {
      if (data.articles.length === 0) throw new Error("No results");
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
};

// 초기 호출
getNews();
