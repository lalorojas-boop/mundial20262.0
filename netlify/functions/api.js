export default async (request, context) => {
  const url = new URL(request.url);
  const path = url.pathname.replace("/.netlify/functions/api", "");
  const search = url.search;
  
  const apiUrl = `https://api.football-data.org/v4${path}${search}`;
  
  const response = await fetch(apiUrl, {
    headers: {
      "X-Auth-Token": "08b94a5548b348d4b1c4c089205114f5",
    },
  });
  
  const data = await response.json();
  
  return new Response(JSON.stringify(data), {
    status: response.status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
};

export const config = { path: "/api/*" };
