// node-fetch 대신 최신 Node 런타임에 내장된 fetch 사용
exports.handler = async (event) => {
  // 1) 프리플라이트 대응
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: "",
    };
  }

  // 2) 쿼리 파라미터 추출
  const {
    country = "us",
    category,
    q,
    page,
    pageSize
  } = event.queryStringParameters || {};

  // 3) .env 에 설정한 키 사용
  const apiKey = process.env.NEWS_API_KEY;
  const url = new URL("https://newsapi.org/v2/top-headlines");
  url.searchParams.set("apiKey", apiKey);
  url.searchParams.set("country", country);
  if (category) url.searchParams.set("category", category);
  if (q)        url.searchParams.set("q", q);
  if (page)     url.searchParams.set("page", page);
  if (pageSize) url.searchParams.set("pageSize", pageSize);

  try {
    const res = await fetch(url.toString());
    const data = await res.json();

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(data),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ message: err.message }),
    };
  }
};
