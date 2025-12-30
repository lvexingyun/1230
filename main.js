// 简单状态管理
let hasConfig = false; // 真实项目中应从后端/Supabase 查询

const dom = {
  messages: document.getElementById("messages"),
  inputText: document.getElementById("inputText"),
  sendButton: document.getElementById("sendButton"),
  safeModeToggle: document.getElementById("safeModeToggle"),
  settingsButton: document.getElementById("settingsButton"),
  settingsPanel: document.getElementById("settingsPanel"),
  closeSettingsButton: document.getElementById("closeSettingsButton"),
  settingsForm: document.getElementById("settingsForm"),
  settingsStatus: document.getElementById("settingsStatus"),
};

function appendUserMessage(text) {
  const wrapper = document.createElement("div");
  wrapper.className = "message message-user";
  wrapper.innerHTML = `
    <div class="message-body">
      <div class="message-bubble">${escapeHtml(text)}</div>
    </div>
    <div class="message-avatar">你</div>
  `;
  dom.messages.appendChild(wrapper);
  dom.messages.scrollTop = dom.messages.scrollHeight;
}

function appendAssistantMessage(payload) {
  const { level, offense, replies } = payload;
  const wrapper = document.createElement("div");
  wrapper.className = "message message-assistant";

  const levelClass = `badge-level-${level}`;
  const levelText = `爹味等级 ${level}`;

  wrapper.innerHTML = `
    <div class="message-avatar">AI</div>
    <div class="message-body">
      <div class="assistant-card">
        <div class="badge-level ${levelClass}">${levelText}</div>
        <div class="offense-text">${escapeHtml(offense)}</div>
        <div class="reply-tags">
          ${replies
            .map(
              (r) => `
            <button class="reply-pill" type="button" data-text="${escapeAttribute(
              r.text
            )}">
              <div class="reply-pill-title">${escapeHtml(r.label)}</div>
              <div class="reply-pill-text">${escapeHtml(r.text)}</div>
              <div class="reply-pill-hint">点击复制</div>
            </button>
          `
            )
            .join("")}
        </div>
      </div>
    </div>
  `;

  dom.messages.appendChild(wrapper);

  // 绑定复制事件
  wrapper.querySelectorAll(".reply-pill").forEach((btn) => {
    btn.addEventListener("click", () => {
      const text = btn.dataset.text || "";
      navigator.clipboard
        .writeText(text)
        .then(() => {
          dom.settingsStatus.textContent = `已复制话术，可以直接粘贴使用～`;
          dom.settingsStatus.className = "settings-status success";
        })
        .catch(() => {
          dom.settingsStatus.textContent = `复制失败，可以手动选中文本复制`;
          dom.settingsStatus.className = "settings-status error";
        });
    });
  });

  dom.messages.scrollTop = dom.messages.scrollHeight;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeAttribute(str) {
  return String(str).replace(/"/g, "&quot;");
}

async function handleSend() {
  const text = dom.inputText.value.trim();
  if (!text) return;

  // 首次使用且尚未配置，弹出设置面板
  if (!hasConfig) {
    openSettingsPanel();
    return;
  }

  appendUserMessage(text);
  dom.inputText.value = "";

  const safeMode = dom.safeModeToggle.checked;

  // TODO：这里应调用后端 /api/analyze，将 text 和 safeMode 发送给后端
  // 目前先用前端 mock，方便你之后替换为真实 API 调用
  const mock = mockAnalyze(text, safeMode);
  appendAssistantMessage(mock);
}

function mockAnalyze(text, safeMode) {
  // 非正式逻辑：仅用来展示 UI 流程
  const level = text.length > 20 ? 2 : 1;
  const offense =
    level === 1
      ? "这句话略显居高临下，容易让人感觉自己的判断被轻视。"
      : "这句话带有明显的否定和指点，会削弱你的专业感和自信。";

  const replies = [
    {
      label: "温柔坚定",
      text: safeMode
        ? "我理解你的好意，不过这个决定我想先按照自己的节奏来试一试。"
        : "谢谢你的建议，不过现在这个选择是我认真考虑后的决定，我想先按自己的方案来。",
    },
    {
      label: "幽默轻松",
      text: safeMode
        ? "哈哈，原来我还有这么多“改进空间”，那就先让我试着踩踩坑吧。"
        : "听起来我好像刚出新手村，不过我想先自己打几局试试手感～",
    },
    {
      label: "阴阳回怼",
      text: safeMode
        ? "听上去你很有经验，我也会参考，但最后的选择还是得由我自己负责。"
        : "原来按你说的才算“成熟”，那我可能还是更想保留一点自己的想法。",
    },
  ];

  return { level, offense, replies };
}

function openSettingsPanel() {
  dom.settingsPanel.classList.remove("hidden");
}

function closeSettingsPanel() {
  dom.settingsPanel.classList.add("hidden");
}

async function handleSettingsSubmit(event) {
  event.preventDefault();
  const formData = new FormData(dom.settingsForm);

  const apiBaseUrl = formData.get("apiBaseUrl");
  const apiKey = formData.get("apiKey");
  const modelName = formData.get("modelName");
  const supabaseUrl = formData.get("supabaseUrl");
  const supabaseKey = formData.get("supabaseKey");

  dom.settingsStatus.textContent = "正在保存配置…";
  dom.settingsStatus.className = "settings-status";

  try {
    // TODO：在这里调用后端 /api/config 或直接通过 Supabase SDK 写入数据库
    // 目前仅在前端模拟成功

    console.log("配置信息（请在真实项目中改为安全的后端存储）", {
      apiBaseUrl,
      apiKey,
      modelName,
      supabaseUrl,
      supabaseKey,
    });

    hasConfig = true;

    dom.settingsStatus.textContent = "配置已保存。后续前端将不再展示敏感信息。";
    dom.settingsStatus.className = "settings-status success";

    setTimeout(() => {
      closeSettingsPanel();
    }, 800);
  } catch (error) {
    console.error(error);
    dom.settingsStatus.textContent = "保存失败，请稍后重试。";
    dom.settingsStatus.className = "settings-status error";
  }
}

function initEvents() {
  dom.sendButton.addEventListener("click", handleSend);
  dom.inputText.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  });

  dom.settingsButton.addEventListener("click", () => {
    // 如果已经有配置，按需求可以在这里选择：
    // 1. 仅展示“已配置”状态；2. 允许修改非敏感字段；3. 暂不开放修改。
    openSettingsPanel();
  });

  dom.closeSettingsButton.addEventListener("click", closeSettingsPanel);

  dom.settingsForm.addEventListener("submit", handleSettingsSubmit);
}

document.addEventListener("DOMContentLoaded", () => {
  initEvents();
});


