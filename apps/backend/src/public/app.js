const state = {
  exam: null,
  currentPartIndex: 0,
  answers: {},
  examId: "",
  candidateId: ""
};

const configForm = document.getElementById("configForm");
const uploadForm = document.getElementById("uploadForm");
const uploadStatus = document.getElementById("uploadStatus");
const startBtn = document.getElementById("startBtn");
const examPanel = document.getElementById("examPanel");
const examTitle = document.getElementById("examTitle");
const partMeta = document.getElementById("partMeta");
const partPrompt = document.getElementById("partPrompt");
const optionsBox = document.getElementById("optionsBox");
const textAnswer = document.getElementById("textAnswer");
const resultBox = document.getElementById("resultBox");

function getCurrentPart() {
  return state.exam?.parts?.[state.currentPartIndex] ?? null;
}

function renderPart() {
  const part = getCurrentPart();
  if (!part) return;

  examTitle.textContent = `${state.exam.subject} (${state.exam.id})`;
  partMeta.textContent = `Part ${state.currentPartIndex + 1}/${state.exam.parts.length} • ${part.title} • ${part.maxScore} điểm`;
  partPrompt.textContent = part.prompt;

  optionsBox.innerHTML = "";
  textAnswer.classList.add("hidden");

  if (part.type === "multiple_choice") {
    const options = part.options || ["A", "B", "C", "D"];
    options.forEach((option) => {
      const id = `${part.id}-${option}`;
      const wrap = document.createElement("label");
      wrap.innerHTML = `<input type="radio" name="mc" value="${option}" id="${id}" ${state.answers[part.id] === option ? "checked" : ""}/> ${option}`;
      optionsBox.appendChild(wrap);
      optionsBox.appendChild(document.createElement("br"));
    });
  } else {
    textAnswer.classList.remove("hidden");
    textAnswer.value = state.answers[part.id] || "";
  }
}

function saveCurrentAnswer() {
  const part = getCurrentPart();
  if (!part) return;

  if (part.type === "multiple_choice") {
    const checked = document.querySelector('input[name="mc"]:checked');
    state.answers[part.id] = checked ? checked.value : "";
  } else {
    state.answers[part.id] = textAnswer.value.trim();
  }
}

configForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const body = Object.fromEntries(new FormData(configForm).entries());
  const res = await fetch("/api/config", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  alert(res.ok ? "Đã lưu cấu hình AI" : "Lưu cấu hình thất bại");
});

uploadForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  uploadStatus.textContent = "Đang phân tích đề...";

  const formData = new FormData(uploadForm);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 35000);

  try {
    const res = await fetch("/api/exams/upload", { method: "POST", body: formData, signal: controller.signal });
    const data = await res.json();

    if (!res.ok) {
      uploadStatus.textContent = `Lỗi: ${data.message || "Upload thất bại"}`;
      return;
    }

    uploadStatus.textContent = `✅ Tạo đề xong. examId = ${data.exam.id}`;
    document.getElementById("examIdInput").value = data.exam.id;
  } catch {
    uploadStatus.textContent = "Hệ thống không phản hồi kịp (timeout), nhưng server không bị treo. Hãy thử lại.";
  } finally {
    clearTimeout(timeout);
  }
});

startBtn.addEventListener("click", async () => {
  state.examId = document.getElementById("examIdInput").value.trim();
  state.candidateId = document.getElementById("candidateIdInput").value.trim();

  if (!state.examId || !state.candidateId) {
    alert("Vui lòng nhập examId và mã thí sinh");
    return;
  }

  const res = await fetch(`/api/exams/${state.examId}/candidate`);
  const data = await res.json();
  if (!res.ok) {
    alert(data.message || "Không tải được đề");
    return;
  }

  state.exam = data.exam;
  state.currentPartIndex = 0;
  state.answers = {};
  examPanel.classList.remove("hidden");
  renderPart();
});

document.getElementById("savePartBtn").addEventListener("click", () => {
  saveCurrentAnswer();
  alert("Đã lưu part hiện tại");
});

document.getElementById("nextPartBtn").addEventListener("click", () => {
  saveCurrentAnswer();
  if (state.currentPartIndex < state.exam.parts.length - 1) {
    state.currentPartIndex += 1;
    renderPart();
  }
});

document.getElementById("submitBtn").addEventListener("click", async () => {
  saveCurrentAnswer();
  const payload = {
    examId: state.examId,
    candidateId: state.candidateId,
    answers: state.answers
  };

  const res = await fetch("/api/exams/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  if (!res.ok) {
    alert(data.message || "Nộp bài thất bại");
    return;
  }

  resultBox.textContent = JSON.stringify(data.grade, null, 2);
});
