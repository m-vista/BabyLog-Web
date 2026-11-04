const ML_PER_OZ = 29.5735295625;

async function sendRequest(path, options = {}) {
  const response = await fetch(`/api/bottles${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Request failed.");
  }

  return result;
}

function createBottle({
  startTime,
  breastMilkOz,
  formulaOz,
  notes = "",
}) {
  const bottle = {
    startTime: new Date(startTime).toISOString(),
    breastMilkAmountMl: Number(breastMilkOz) * ML_PER_OZ,
    formulaAmountMl: Number(formulaOz) * ML_PER_OZ,
    unspecifiedAmountMl: 0,
    notes,
  };

  return sendRequest("", {
    method: "POST",
    body: JSON.stringify(bottle),
  });
}

function getBottlesByDate(date) {
  const start = new Date(`${date}T00:00:00`);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  const parameters = new URLSearchParams({
    start: start.toISOString(),
    end: end.toISOString(),
  });

  return sendRequest(`?${parameters}`);
}

function getLatestBottle() {
  return sendRequest("/latest");
}

function updateBottle(id, changes) {
  return sendRequest(`/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(changes),
  });
}

export {
  createBottle,
  getBottlesByDate,
  getLatestBottle,
  updateBottle,
};