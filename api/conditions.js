const API_KEY = process.env.SUBSIDY_API_KEY || "ba1089178ce88f919521ac44ba0345d83bb271991ffb9d1f7bd8e5e8e96a353c";
const BASE = "https://api.odcloud.kr/api/gov24/v3";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");

  const { serviceId = "", page = 1, perPage = 100 } = req.query;

  let url = `${BASE}/supportConditions?serviceKey=${encodeURIComponent(API_KEY)}&page=${page}&perPage=${perPage}&returnType=JSON`;
  if (serviceId) url += `&cond[서비스ID::EQ]=${encodeURIComponent(serviceId)}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
