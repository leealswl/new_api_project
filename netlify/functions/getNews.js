exports.handler = async (event) => {

  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ status: "error", message: "Missing NEWS_API_KEY" }),
    };
  }

  const res = await fetch(url.toString());
  const data = await res.json();
  console.log("🔔 NewsAPI 응답:", data);   

  if (data.status !== "ok") {
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ status: "error", message: data.message }),
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
};
