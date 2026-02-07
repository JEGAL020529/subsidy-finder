const API_KEY = process.env.SUBSIDY_API_KEY || "ba1089178ce88f919521ac44ba0345d83bb271991ffb9d1f7bd8e5e8e96a353c";
const BASE = "https://api.odcloud.kr/api/gov24/v3";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");

  const { page = 1, perPage = 20, search = "", category = "", userType = "" } = req.query;

  let url = `${BASE}/serviceList?serviceKey=${encodeURIComponent(API_KEY)}&page=${page}&perPage=${perPage}&returnType=JSON`;
  if (search) url += `&cond[서비스명::LIKE]=${encodeURIComponent(search)}`;
  if (category) url += `&cond[서비스분야::LIKE]=${encodeURIComponent(category)}`;
  if (userType) url += `&cond[사용자구분::LIKE]=${encodeURIComponent(userType)}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
