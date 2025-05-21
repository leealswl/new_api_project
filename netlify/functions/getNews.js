exports.handler = async (event) => {
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

  const {
    country = "us",
    category,
    q,
    page,
    pageSize
  } = event.queryStringParameters || {};

  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ status: "error", message: "Missing NEWS_API_KEY" })
    };
  }

  const fetchUrl = new URL("https://newsapi.org/v2/top-headlines");
  fetchUrl.searchParams.set("apiKey", apiKey);
  fetchUrl.searchParams.set("country", country);
  if (category) fetchUrl.searchParams.set("category", category);
  if (q)        fetchUrl.searchParams.set("q", q);
  if (page)     fetchUrl.searchParams.set("page", page);
  if (pageSize) fetchUrl.searchParams.set("pageSize", pageSize);

  try {
    const res = await fetch(fetchUrl.toString());
    const data = await res.json();
    console.log("🔔 NewsAPI 응답 전체:", data);

    if (data.status !== "ok") {
      return {
        statusCode: 500,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ status: "error", message: data.message })
      };
    }

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
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ status: "error", message: err.message }),
    };
  }
};
