const fetch = require("node-fetch");

exports.handler = async (event) => { 
  const {
    country = "us",
    category,
    q,
    page,
    pageSize
  } = event.queryStringParameters || {};

  const apiKey = import.meta.env.VITE_NEWS_API_KEY;
  const url = new URL("https://newsapi.org/v2/top-headlines");

  url.searchParams.set("apiKey", apiKey);
  url.searchParams.set("country", country);
  if (category)  url.searchParams.set("category", category);
  if (q)         url.searchParams.set("q", q);
  if (page)      url.searchParams.set("page", page);
  if (pageSize)  url.searchParams.set("pageSize", pageSize);

  try {
    const res = await fetch(url.toString());
    const data = await res.json();

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: err.message }),
    };
  }
};
