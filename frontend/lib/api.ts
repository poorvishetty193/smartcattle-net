const API_URL = "http://127.0.0.1:8000";

export async function predict(data: any, token: string) {
  const response = await fetch(`${API_URL}/predict`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Prediction failed");
  }

  return response.json();
}

export async function getPredictionHistory(cowId: string, token: string) {
  const response = await fetch(`${API_URL}/predict/history?cow_id=${cowId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("History fetch failed");
  }

  return response.json();
}
